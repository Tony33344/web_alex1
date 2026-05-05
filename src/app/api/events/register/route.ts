import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createDynamicCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';
import { formatDateRangeWithTime } from '@/lib/utils/dates';
import { getActivePricing } from '@/lib/utils/pricing';

export async function POST(request: Request) {
  try {
    // Check for required env vars
    if (!process.env.NEXT_SUPABASE_SERVICE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
      return NextResponse.json({ error: 'Server configuration error: Missing service key' }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestUrl = new URL(request.url);
    const appUrl = requestUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { eventId, paymentMethod, locale = 'en' } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: event } = await adminSupabase
      .from('events')
      .select('id, title_en, max_attendees, current_attendees, price, currency, stripe_price_id, early_bird_price, early_bird_deadline, early_bird_stripe_price_id, start_date, is_online, location')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get active pricing (early bird if applicable)
    const pricing = getActivePricing(event);
    const activePrice = pricing.activePrice;
    const activeStripePriceId = pricing.activeStripePriceId;

    // Check for existing ACTIVE registration (cancelled ones allow re-registration)
    const { data: existing } = await adminSupabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Already registered' }, { status: 409 });
    }

    // Clean up any old cancelled registrations for this user+event to allow fresh registration
    await adminSupabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .eq('status', 'cancelled');

    const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;
    const isFree = !event.price || event.price <= 0;
    const status = isFull ? 'waitlisted' : 'registered';
    const paymentStatus = isFree ? 'free' : 'pending';
    const method = isFree ? 'free' : (paymentMethod || 'stripe');

    // Generate bank transfer reference if needed
    const bankRef = method === 'bank_transfer'
      ? `EVT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    // Insert registration - use only base columns that exist in original schema
    // bank_transfer_reference is stored in notes field as fallback
    const notes = bankRef ? `Bank transfer reference: ${bankRef}` : null;
    
    const { error } = await adminSupabase.from('event_registrations').insert({
      event_id: eventId,
      user_id: user.id,
      status,
      payment_status: paymentStatus,
      notes,
    });

    if (error) {
      console.error('Event registration insert error:', error.message);
      return NextResponse.json({ error: 'Registration failed: ' + error.message }, { status: 500 });
    }

    // Free events — send confirmation email and increment count
    if (isFree) {
      try {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const userName = profile?.full_name || user.email?.split('@')[0] || 'there';
        const eventUrl = `${appUrl}/${locale}/events/${eventId}`;
        const orderId = `FREE-${Date.now().toString(36).toUpperCase()}`;
        
        const emailContent = prepareEmail({
          to: user.email!,
          subject: 'Free Event Registration Confirmed',
          template: EmailTemplates.FREE_EVENT_REGISTRATION,
          variables: {
            user_name: userName,
            event_title: event.title_en || 'Event',
            event_date: event.start_date ? new Date(event.start_date).toLocaleDateString(locale, { dateStyle: 'long' }) : 'TBA',
            event_time: event.start_date ? new Date(event.start_date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
            event_location: event.is_online ? 'Online' : (event.location || 'TBA'),
            event_url: eventUrl,
            calendar_url: eventUrl,
            order_id: orderId,
          },
        });

        await sendEmail({
          to: user.email!,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error('Failed to send free event confirmation email:', emailError);
        // Don't fail the registration if email fails
      }

      // Increment attendee count for free events (confirmed immediately)
      await adminSupabase
        .from('events')
        .update({ current_attendees: event.current_attendees + 1 })
        .eq('id', eventId);

      return NextResponse.json({ success: true, status });
    }

    // Bank transfer — send pending email and return reference
    if (method === 'bank_transfer') {
      // Store the active price in the registration
      const { error: updateError } = await adminSupabase
        .from('event_registrations')
        .update({ price_paid: activePrice })
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      if (updateError) {
        console.error('Failed to update price_paid:', updateError);
      }

      // Send pending payment email
      try {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const userName = profile?.full_name || user.email?.split('@')[0] || 'there';
        const eventUrl = `${appUrl}/${locale}/events/${eventId}`;

        // Fetch bank info from settings
        const { data: bankSettings } = await adminSupabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['bank_name', 'bank_iban', 'bank_bic', 'bank_account_holder']);

        const bankInfo: Record<string, string> = {};
        (bankSettings ?? []).forEach((row: { key: string; value: unknown }) => {
          const val = String(row.value).replace(/"/g, '').trim();
          if (val) bankInfo[row.key] = val;
        });

        const bankName = bankInfo.bank_name || 'UBS Switzerland AG';
        const bankIban = bankInfo.bank_iban || 'CH93 0076 2011 6238 5295 7';
        const bankBic = bankInfo.bank_bic || 'AEAGCH22';
        const bankAccountHolder = bankInfo.bank_account_holder || 'AMS4EVER AG';

        // Generate QR code for bank transfer
        const qrCodeImage = `<div style="text-align: center; margin-top: 20px; padding: 15px; background: white; border: 1px dashed #DDD6FE; border-radius: 4px;">
          <p style="font-size: 12px; color: #666666; margin: 0 0 10px 0;">Scan with your banking app to pay</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BCD\n001\n1\n${event.currency || 'CHF'}\n${activePrice || '0'}\nS\n${bankIban.replace(/\s/g, '')}\n${bankAccountHolder.replace(/\s/g, '')}\n\n${bankRef}\n" alt="Bank Transfer QR Code" style="width: 150px; height: 150px; display: inline-block;">
        </div>`;
        
        const emailContent = prepareEmail({
          to: user.email!,
          subject: 'Registration Pending - Payment Required',
          template: EmailTemplates.EVENT_REGISTRATION_PENDING,
          variables: {
            user_name: userName,
            event_title: event.title_en || 'Event',
            event_date: event.start_date ? new Date(event.start_date).toLocaleDateString(locale, { dateStyle: 'long' }) : 'TBA',
            event_time: event.start_date ? new Date(event.start_date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
            event_location: event.is_online ? 'Online' : (event.location || 'TBA'),
            payment_amount: activePrice ? `${event.currency || 'CHF'} ${activePrice}` : 'TBA',
            bank_reference: bankRef || 'N/A',
            event_url: eventUrl,
            bank_name: bankName,
            bank_iban: bankIban,
            bank_bic: bankBic,
            bank_account_holder: bankAccountHolder,
            qr_code_image: qrCodeImage,
          },
        });

        await sendEmail({
          to: user.email!,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error('Failed to send pending payment email:', emailError);
        // Don't fail the registration if email fails
      }

      return NextResponse.json({ success: true, status, reference: bankRef });
    }

    // Stripe payment
    if (!isFull) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('stripe_customer_id, full_name')
        .eq('id', user.id)
        .single();

      let customerId = profile?.stripe_customer_id;
      if (!customerId || !customerId.startsWith('cus_')) {
        const customer = await createOrRetrieveCustomer({
          email: user.email!,
          name: profile?.full_name || '',
          supabaseId: user.id,
        });
        customerId = customer.id;
        await adminSupabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
      }

      const stripeMetadata = { user_id: user.id, event_id: eventId, type: 'event' };
      const successUrl = `${appUrl}/${locale}/events?payment=success&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${appUrl}/${locale}/events?payment=cancelled`;

      let session;
      if (activeStripePriceId) {
        // Use active Stripe price (early bird if applicable)
        session = await createCheckoutSession({
          customerId,
          priceId: activeStripePriceId,
          mode: 'payment',
          successUrl,
          cancelUrl,
          metadata: stripeMetadata,
        });
      } else {
        // Dynamic price — works for any event price without Stripe dashboard setup
        session = await createDynamicCheckoutSession({
          customerId,
          productName: event.title_en,
          amountInCents: Math.round(event.price * 100),
          currency: event.currency || 'chf',
          successUrl,
          cancelUrl,
          metadata: stripeMetadata,
        });
      }

      return NextResponse.json({ success: true, status, checkoutUrl: session.url });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('Event registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
