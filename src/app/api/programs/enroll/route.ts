import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programSlug, paymentMethod } = await request.json();

    if (!programSlug) {
      return NextResponse.json({ error: 'Missing programSlug' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: program } = await adminSupabase
      .from('programs')
      .select('id, name_en, price, currency, stripe_price_id')
      .eq('slug', programSlug)
      .single();

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check for existing enrollment
    const { data: existing } = await adminSupabase
      .from('program_enrollments')
      .select('id')
      .eq('program_id', program.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });
    }

    const isFree = !program.price || program.price <= 0;
    const method = isFree ? 'free' : (paymentMethod || 'stripe');
    const paymentStatus = isFree ? 'free' : 'pending';

    // Generate bank transfer reference if needed
    const bankRef = method === 'bank_transfer'
      ? `PRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    // Insert enrollment record using raw SQL to bypass PostgREST schema cache
    const insertSql = method === 'bank_transfer'
      ? `INSERT INTO program_enrollments (program_id, user_id, status, payment_status, payment_method, bank_transfer_reference) 
         VALUES ('${program.id}', '${user.id}', 'enrolled', '${paymentStatus}', '${method}', '${bankRef}')`
      : `INSERT INTO program_enrollments (program_id, user_id, status, payment_status, payment_method) 
         VALUES ('${program.id}', '${user.id}', 'enrolled', '${paymentStatus}', '${method}')`;
    
    let { error: insertError } = await adminSupabase.rpc('exec_sql', { sql: insertSql });
    
    // Fallback: if exec_sql fails, try standard insert without new columns
    if (insertError) {
      console.log('exec_sql failed, trying standard insert:', insertError.message);
      const result = await adminSupabase.from('program_enrollments').insert({
        program_id: program.id,
        user_id: user.id,
        status: 'enrolled',
        payment_status: paymentStatus,
        payment_method: method,
      });
      insertError = result.error;
    }

    if (insertError) {
      console.error('Program enrollment insert error:', JSON.stringify(insertError, null, 2));
      return NextResponse.json({ error: 'Enrollment failed: ' + insertError.message }, { status: 500 });
    }

    // Free program — done
    if (isFree) {
      return NextResponse.json({ success: true, status: 'enrolled' });
    }

    // Bank transfer — return reference
    if (method === 'bank_transfer') {
      return NextResponse.json({ success: true, status: 'enrolled', reference: bankRef, qrCode: `https://chart.googleapis.com/chart?chs=200x200&cht=qr&choe=UTF-8&chl=${bankRef}` });
    }

    // Stripe payment
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('stripe_customer_id, full_name')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await createOrRetrieveCustomer({
        email: user.email!,
        name: profile?.full_name || '',
        supabaseId: user.id,
      });
      customerId = customer.id;
      await adminSupabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (program.stripe_price_id) {
      const session = await createCheckoutSession({
        customerId,
        priceId: program.stripe_price_id,
        mode: 'payment',
        successUrl: `${appUrl}/en/coach-training?payment=success`,
        cancelUrl: `${appUrl}/en/coach-training/${programSlug}?payment=cancelled`,
        metadata: { user_id: user.id, program_id: program.id, type: 'program' },
      });
      return NextResponse.json({ success: true, status: 'enrolled', checkoutUrl: session.url });
    }

    return NextResponse.json({ success: true, status: 'enrolled', paymentPending: true });
  } catch (err) {
    console.error('Program enrollment error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}
