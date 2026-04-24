import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCheckoutSession, createDynamicSubscriptionSession, createOrRetrieveCustomer } from '@/lib/stripe/helpers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestUrl = new URL(request.url);
    const appUrl = requestUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const { plan, planId, locale = 'en' } = await request.json();

    // Fetch the membership plan from database — prefer planId, fallback to plan_type
    const adminSupabase = createAdminClient();
    const query = adminSupabase
      .from('membership_plans')
      .select('*')
      .eq('is_active', true);

    if (planId) {
      query.eq('id', planId);
    } else {
      query.eq('plan_type', plan === 'yearly' ? 'yearly' : 'monthly');
    }

    const { data: plans } = await query.order('display_order', { ascending: true }).limit(1);
    const membershipPlan = plans?.[0];

    if (!membershipPlan) {
      console.error('Membership plan not found for plan_type:', plan === 'yearly' ? 'yearly' : 'monthly');
      return NextResponse.json({ error: 'Membership plan not found. Please contact admin to set up membership plans.' }, { status: 404 });
    }

    console.log('Membership plan found:', { id: membershipPlan.id, name: membershipPlan.name_en, price: membershipPlan.price, currency: membershipPlan.currency });

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Valid Stripe customer IDs start with 'cus_'. Anything else (e.g. bank_pending_*) is bogus and must be replaced.
    if (!customerId || !customerId.startsWith('cus_')) {
      const customer = await createOrRetrieveCustomer({
        email: user.email!,
        name: profile?.full_name || '',
        supabaseId: user.id,
      });
      customerId = customer.id;

      await adminSupabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const stripeMetadata = { user_id: user.id, plan, type: 'membership', plan_id: membershipPlan.id };
    // {CHECKOUT_SESSION_ID} is a Stripe placeholder replaced on redirect; lets us verify and activate without a webhook
    const successUrl = `${appUrl}/${locale}/members?subscription=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/${locale}/membership?cancelled=true`;

    let session;
    if (membershipPlan.stripe_price_id) {
      // Use pre-created Stripe Price (if set)
      session = await createCheckoutSession({
        customerId,
        priceId: membershipPlan.stripe_price_id,
        mode: 'subscription',
        successUrl,
        cancelUrl,
        metadata: stripeMetadata,
      });
    } else {
      // Dynamic subscription price — works for any membership price
      session = await createDynamicSubscriptionSession({
        customerId,
        productName: `${membershipPlan.name_en} (${plan}) Membership`,
        amountInCents: Math.round(membershipPlan.price * 100),
        currency: membershipPlan.currency || 'chf',
        interval: plan === 'yearly' ? 'year' : 'month',
        successUrl,
        cancelUrl,
        metadata: stripeMetadata,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to create checkout session: ${message}` }, { status: 500 });
  }
}
