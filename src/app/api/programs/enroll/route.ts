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

    const { programSlug } = await request.json();

    if (!programSlug) {
      return NextResponse.json({ error: 'Missing programSlug' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: program } = await adminSupabase
      .from('programs')
      .select('id, name_en, price, stripe_price_id')
      .eq('slug', programSlug)
      .single();

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const isFree = !program.price || program.price <= 0;

    if (isFree || !program.stripe_price_id) {
      // Free program or no Stripe price — just redirect to contact
      return NextResponse.json({ success: true, redirect: 'contact' });
    }

    // Paid program with Stripe price → create checkout
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

    const session = await createCheckoutSession({
      customerId,
      priceId: program.stripe_price_id,
      mode: 'payment',
      successUrl: `${appUrl}/en/coach-training?payment=success`,
      cancelUrl: `${appUrl}/en/coach-training/${programSlug}?payment=cancelled`,
      metadata: { user_id: user.id, program_id: program.id, type: 'program' },
    });

    return NextResponse.json({ success: true, checkoutUrl: session.url });
  } catch (err) {
    console.error('Program enrollment error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
