import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { queryDirect } from '@/lib/db/direct';
import { createCheckoutSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';

const escapeLiteral = (value: string | null) =>
  value === null ? 'NULL' : `'${value.replace(/'/g, "''")}'`;

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

    // Use direct SQL to bypass PostgREST schema cache
    const { data: program, error: programError } = await queryDirect(
      'SELECT id, name_en, price, currency, stripe_price_id FROM programs WHERE slug = $1',
      [programSlug]
    );

    let p = program?.[0];

    if ((!p || programError) && process.env.NEXT_SUPABASE_SERVICE_KEY) {
      const fallbackSql = `SELECT id, name_en, price, currency, stripe_price_id FROM programs WHERE slug = ${escapeLiteral(programSlug)} LIMIT 1;`;
      const { data: fallbackData, error: fallbackError } = await adminSupabase.rpc('exec_sql', { sql: fallbackSql });
      if (fallbackError) {
        console.error('Program fallback query error:', fallbackError);
      } else if (fallbackData && fallbackData.length > 0) {
        p = fallbackData[0];
      }
    }

    if (!p) {
      console.log('Program not found for slug:', programSlug, 'direct error:', programError);
      return NextResponse.json({ error: 'Program not found: ' + programSlug }, { status: 404 });
    }

    const isFree = !p.price || p.price <= 0;
    const method = isFree ? 'free' : (paymentMethod || 'stripe');
    const paymentStatus = isFree ? 'free' : 'pending';
    const bankRef = method === 'bank_transfer'
      ? `PRG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      : null;

    // Insert enrollment using direct SQL
    const { error: insertError } = await queryDirect(
      'INSERT INTO program_enrollments (program_id, user_id, status, payment_status) VALUES ($1, $2, $3, $4)',
      [p.id, user.id, 'enrolled', paymentStatus]
    );

    let insertionFailed = insertError;

    if (insertError && process.env.NEXT_SUPABASE_SERVICE_KEY) {
      const insertSql = `INSERT INTO program_enrollments (program_id, user_id, status, payment_status) VALUES (${escapeLiteral(p.id)}, ${escapeLiteral(user.id)}, 'enrolled', ${escapeLiteral(paymentStatus)});`;
      const { error: fallbackInsertError } = await adminSupabase.rpc('exec_sql', { sql: insertSql });
      insertionFailed = fallbackInsertError;
    }

    if (insertionFailed) {
      const msg = (insertionFailed as Error).message || '';
      if (msg.includes('duplicate') || msg.includes('unique')) {
        return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });
      }
      console.error('Enrollment insert error:', msg);
      return NextResponse.json({ error: 'Enrollment failed: ' + msg }, { status: 500 });
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
    const { data: profile } = await queryDirect(
      'SELECT stripe_customer_id, full_name FROM profiles WHERE id = $1',
      [user.id]
    );

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
    return NextResponse.json({ error: 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown') }, { status: 500 });
  }
}
