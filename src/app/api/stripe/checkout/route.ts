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

    const { plan } = await request.json();

    // Fetch the membership plan from database
    const adminSupabase = createAdminClient();
    const { data: membershipPlan } = await adminSupabase
      .from('membership_plans')
      .select('*')
      .eq('plan_type', plan === 'yearly' ? 'yearly' : 'monthly')
      .eq('is_active', true)
      .maybeSingle();

    if (!membershipPlan) {
      return NextResponse.json({ error: 'Membership plan not found' }, { status: 404 });
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('*')
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

      await adminSupabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const stripeMetadata = { user_id: user.id, plan, type: 'membership' };
    const successUrl = `${appUrl}/en/profile?subscription=success`;
    const cancelUrl = `${appUrl}/en/membership?cancelled=true`;

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
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
