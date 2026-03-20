import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { queryDirect } from '@/lib/db/direct';
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

    // Use direct SQL to bypass PostgREST schema cache completely
    const { data: program, error: programError } = await queryDirect(
      'SELECT id, name_en, price, currency, stripe_price_id FROM programs WHERE slug = $1',
      [programSlug]
    );

    if (programError) {
      console.error('Program query error:', programError);
      return NextResponse.json({ 
        error: 'Database connection failed: ' + (programError instanceof Error ? programError.message : 'Unknown error') 
      }, { status: 500 });
    }
    
    if (!program || program.length === 0) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const p = program[0];

    // Check existing enrollment
    const { data: existing, error: existingError } = await queryDirect(
      'SELECT id FROM program_enrollments WHERE program_id = $1 AND user_id = $2',
      [p.id, user.id]
    );

    if (existingError) {
      console.error('Enrollment check error:', existingError);
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });
    }

    const isFree = !p.price || p.price <= 0;
    const method = isFree ? 'free' : (paymentMethod || 'stripe');
    const paymentStatus = isFree ? 'free' : 'pending';
    const bankRef = method === 'bank_transfer'
      ? `PRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    // Insert enrollment with direct SQL
    const { error: insertError } = await queryDirect(
      `INSERT INTO program_enrollments (program_id, user_id, status, payment_status, payment_method, bank_transfer_reference)
       VALUES ($1, $2, 'enrolled', $3, $4, $5)`,
      [p.id, user.id, paymentStatus, method, bankRef]
    );

    if (insertError) {
      console.error('Enrollment insert error:', insertError);
      return NextResponse.json({ error: 'Enrollment failed: ' + (insertError as Error).message }, { status: 500 });
    }

    // Free program
    if (isFree) {
      return NextResponse.json({ success: true, status: 'enrolled' });
    }

    // Bank transfer
    if (method === 'bank_transfer') {
      return NextResponse.json({ success: true, status: 'enrolled', reference: bankRef });
    }

    // Stripe
    const { data: profile, error: profileError } = await queryDirect(
      'SELECT stripe_customer_id, full_name FROM profiles WHERE id = $1',
      [user.id]
    );

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    let customerId = profile?.[0]?.stripe_customer_id;
    if (!customerId) {
      const customer = await createOrRetrieveCustomer({
        email: user.email!,
        name: profile?.[0]?.full_name || '',
        supabaseId: user.id,
      });
      customerId = customer.id;
      await queryDirect(
        'UPDATE profiles SET stripe_customer_id = $1 WHERE id = $2',
        [customerId, user.id]
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (p.stripe_price_id) {
      const session = await createCheckoutSession({
        customerId,
        priceId: p.stripe_price_id,
        mode: 'payment',
        successUrl: `${appUrl}/en/coach-training?payment=success`,
        cancelUrl: `${appUrl}/en/coach-training/${programSlug}?payment=cancelled`,
        metadata: { user_id: user.id, type: 'program' },
      });
      return NextResponse.json({ success: true, status: 'enrolled', checkoutUrl: session.url });
    }

    return NextResponse.json({ success: true, status: 'enrolled', paymentPending: true });
  } catch (err) {
    console.error('Program enrollment error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
