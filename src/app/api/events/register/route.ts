import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createDynamicCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';

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

    const { eventId, paymentMethod } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: event } = await adminSupabase
      .from('events')
      .select('id, title_en, max_attendees, current_attendees, price, currency, stripe_price_id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

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

    if (!isFull) {
      await adminSupabase
        .from('events')
        .update({ current_attendees: event.current_attendees + 1 })
        .eq('id', eventId);
    }

    // Free events — done
    if (isFree) {
      return NextResponse.json({ success: true, status });
    }

    // Bank transfer — return reference
    if (method === 'bank_transfer') {
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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const stripeMetadata = { user_id: user.id, event_id: eventId, type: 'event' };
      const successUrl = `${appUrl}/en/events?payment=success`;
      const cancelUrl = `${appUrl}/en/events?payment=cancelled`;

      let session;
      if (event.stripe_price_id) {
        // Use pre-created Stripe Price
        session = await createCheckoutSession({
          customerId,
          priceId: event.stripe_price_id,
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
