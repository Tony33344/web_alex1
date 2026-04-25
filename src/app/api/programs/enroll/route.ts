import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createDynamicCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';

// Force redeploy - v2
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programSlug, paymentMethod, locale = 'en' } = await request.json();

    if (!programSlug) {
      return NextResponse.json({ error: 'Missing programSlug' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: program, error: programError } = await adminSupabase
      .from('programs')
      .select('id, name_en, price, currency, stripe_price_id')
      .eq('slug', programSlug)
      .single();

    if (programError || !program) {
      console.error('Program lookup failed:', programError?.message);
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

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

    // Free program
    if (isFree) {
      return NextResponse.json({ success: true, status: 'enrolled' });
    }

    // Bank transfer - return reference
    if (method === 'bank_transfer') {
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
    const successUrl = `${appUrl}/${locale}/coach-training?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/${locale}/coach-training/${programSlug}?payment=cancelled`;

    let session;
    if (program.stripe_price_id) {
      session = await createCheckoutSession({
        customerId,
        priceId: program.stripe_price_id,
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
