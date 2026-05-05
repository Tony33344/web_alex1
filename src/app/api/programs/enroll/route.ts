import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createDynamicCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';
import { getActivePricing } from '@/lib/utils/pricing';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getProgramSlug(program: { slug: string; name_en: string }): string {
  if (program.slug && !isUuid(program.slug)) return program.slug;
  return generateSlug(program.name_en);
}

// Force redeploy - v3
export async function POST(request: Request) {
  console.log('Program enroll API called');
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('Unauthorized - no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId, paymentMethod, locale = 'en' } = await request.json();

    console.log('Program enrollment request:', { programId, paymentMethod, locale, userId: user.id });

    if (!programId) {
      console.log('Missing programId');
      return NextResponse.json({ error: 'Missing programId' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: program, error: programError } = await adminSupabase
      .from('programs')
      .select('id, name_en, price, currency, stripe_price_id, early_bird_price, early_bird_deadline, early_bird_stripe_price_id, slug, start_date, duration, location, max_participants')
      .eq('id', programId)
      .eq('is_active', true)
      .maybeSingle();

    if (programError || !program) {
      console.error('Program lookup failed:', programError?.message);
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get active pricing (early bird if applicable)
    const pricing = getActivePricing(program);
    const activePrice = pricing.activePrice;
    const activeStripePriceId = pricing.activeStripePriceId;

    // Clean up any old cancelled enrollments for this user+program to allow fresh enrollment
    await adminSupabase
      .from('program_enrollments')
      .delete()
      .eq('program_id', program.id)
      .eq('user_id', user.id)
      .eq('status', 'cancelled');

    const isFree = !program.price || program.price <= 0;
    const method = isFree ? 'free' : (paymentMethod || 'stripe');
    const paymentStatus = isFree ? 'free' : 'pending';
    const bankRef = method === 'bank_transfer'
      ? `PRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    // Insert enrollment using exec_sql to bypass schema cache
    const insertSql = bankRef
      ? `INSERT INTO program_enrollments (program_id, user_id, status, payment_status, payment_method, bank_transfer_reference)
         VALUES ($$${program.id}$$, $$${user.id}$$, 'enrolled', $$${paymentStatus}$$, $$${method}$$, $$${bankRef}$$)`
      : `INSERT INTO program_enrollments (program_id, user_id, status, payment_status, payment_method)
         VALUES ($$${program.id}$$, $$${user.id}$$, 'enrolled', $$${paymentStatus}$$, $$${method}$$)`;

    let { error: insertError } = await adminSupabase.rpc('exec_sql', { sql: insertSql });

    if (insertError) {
      console.log('exec_sql enrollment insert failed:', insertError.message);
      const fallback = await adminSupabase.from('program_enrollments').insert({
        program_id: program.id,
        user_id: user.id,
        status: 'enrolled',
        payment_status: paymentStatus,
        payment_method: method,
      });
      insertError = fallback.error;
    }

    if (insertError) {
      if (insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
        return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });
      }
      console.error('Program enrollment insert error:', insertError.message);
      return NextResponse.json({ error: 'Enrollment failed: ' + insertError.message }, { status: 500 });
    }

    // Free program — send confirmation email
    if (isFree) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      try {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const userName = profile?.full_name || user.email?.split('@')[0] || 'there';
        const programSlug = getProgramSlug(program);
        const programUrl = `${appUrl}/${locale}/coach-training/${programSlug}`;
        const orderId = `FREE-${Date.now().toString(36).toUpperCase()}`;
        
        const emailContent = prepareEmail({
          to: user.email!,
          subject: 'Free Program Enrollment Confirmed',
          template: EmailTemplates.FREE_PROGRAM_ENROLLMENT,
          variables: {
            user_name: userName,
            program_title: program.name_en || 'Program',
            program_duration: program.duration || 'TBA',
            program_type: 'Coach Training',
            program_location: (program as any).location || 'TBA',
            program_url: programUrl,
            order_id: orderId,
          },
        });

        await sendEmail({
          to: user.email!,
          subject: emailContent.subject,
          html: emailContent.html,
        });
      } catch (emailError) {
        console.error('Failed to send free program confirmation email:', emailError);
        // Don't fail the enrollment if email fails
      }

      return NextResponse.json({ success: true, status: 'enrolled' });
    }

    // Bank transfer - send pending email and return reference
    if (method === 'bank_transfer') {
      console.log('Processing bank transfer enrollment');
      
      // Store the active price in the enrollment
      const { error: updateError } = await adminSupabase
        .from('program_enrollments')
        .update({ price_paid: activePrice })
        .eq('program_id', program.id)
        .eq('user_id', user.id);
      if (updateError) {
        console.error('Failed to update price_paid:', updateError);
      }
      
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

      // Generate QR code placeholder (in production, this would be a real QR code image)
      const qrCodeImage = `<div style="text-align: center; margin-top: 20px; padding: 15px; background: white; border: 1px dashed #DDD6FE; border-radius: 4px;">
        <p style="font-size: 12px; color: #666666; margin: 0 0 10px 0;">Scan with your banking app to pay</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BCD\n001\n1\nCHF\n${program.price || '0'}\nS\n${bankIban.replace(/\s/g, '')}\n${bankAccountHolder.replace(/\s/g, '')}\n\n${bankRef}\n" alt="Bank Transfer QR Code" style="width: 150px; height: 150px; display: inline-block;">
      </div>`;

      // Send pending payment email
      try {
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        const userName = profile?.full_name || user.email?.split('@')[0] || 'there';
        const programSlug = getProgramSlug(program);
        const programUrl = `${appUrl}/${locale}/coach-training/${programSlug}`;

        console.log('Preparing bank transfer email for:', user.email, 'Program:', program.name_en, 'Reference:', bankRef);

        const emailContent = prepareEmail({
          to: user.email!,
          subject: 'Enrollment Pending - Payment Required',
          template: EmailTemplates.COACH_TRAINING_REGISTRATION_PENDING,
          variables: {
            user_name: userName,
            program_name: program.name_en || 'Program',
            program_duration: program.duration || 'TBA',
            start_date: program.start_date ? new Date(program.start_date).toLocaleDateString(locale, { dateStyle: 'long' }) : 'TBA',
            program_time: program.start_date ? new Date(program.start_date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
            location: (program as any).location || 'TBA',
            payment_amount: activePrice ? `${program.currency || 'CHF'} ${activePrice}` : 'TBA',
            bank_reference: bankRef || 'N/A',
            program_url: programUrl,
            bank_name: bankName,
            bank_iban: bankIban,
            bank_bic: bankBic,
            bank_account_holder: bankAccountHolder,
            qr_code_image: qrCodeImage,
          },
        });

        console.log('Sending email to:', user.email);
        await sendEmail({
          to: user.email!,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        console.log('Bank transfer email sent successfully');
      } catch (emailError) {
        console.error('Failed to send pending payment email:', emailError);
        // Don't fail the enrollment if email fails
      }

      return NextResponse.json({ success: true, status: 'enrolled', reference: bankRef });
    }

    // Stripe payment
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .maybeSingle();

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
    const stripeMetadata = { user_id: user.id, program_id: program.id, type: 'program' };
    const programSlug = getProgramSlug(program);
    const successUrl = `${appUrl}/${locale}/coach-training?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/${locale}/coach-training/${programSlug}?payment=cancelled`;

    let session;
    if (activeStripePriceId) {
      session = await createCheckoutSession({
        customerId,
        priceId: activeStripePriceId,
        mode: 'payment',
        successUrl,
        cancelUrl,
        metadata: stripeMetadata,
      });
    } else {
      // Dynamic pricing — uses price from database
      session = await createDynamicCheckoutSession({
        customerId,
        productName: program.name_en,
        amountInCents: Math.round(program.price * 100),
        currency: program.currency || 'chf',
        successUrl,
        cancelUrl,
        metadata: stripeMetadata,
      });
    }

    return NextResponse.json({ success: true, status: 'enrolled', checkoutUrl: session.url });
  } catch (err) {
    console.error('Program enrollment error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown') }, { status: 500 });
  }
}
