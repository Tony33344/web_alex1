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

    // Use the SQL function to handle enrollment (bypasses PostgREST cache)
    const { data: result, error: rpcError } = await adminSupabase.rpc('enroll_program', {
      p_user_id: user.id,
      p_program_slug: programSlug,
      p_payment_method: paymentMethod || 'stripe'
    });

    if (rpcError) {
      console.error('enroll_program RPC error:', rpcError);
      return NextResponse.json({ error: 'Enrollment failed: ' + rpcError.message }, { status: 500 });
    }

    // Handle SQL function result
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
    }

    const { success, reference, checkout_url, error_message } = result[0];

    if (!success) {
      return NextResponse.json({ error: error_message || 'Enrollment failed' }, { status: 400 });
    }

    if (error_message) {
      return NextResponse.json({ error: error_message }, { status: 400 });
    }

    // Free program
    if (!reference && !checkout_url) {
      return NextResponse.json({ success: true, status: 'enrolled' });
    }

    // Bank transfer - return reference
    if (reference) {
      return NextResponse.json({ success: true, status: 'enrolled', reference });
    }

    // Stripe - create checkout session
    if (checkout_url) {
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
        priceId: checkout_url, // This is actually the stripe_price_id
        mode: 'payment',
        successUrl: `${appUrl}/en/coach-training?payment=success`,
        cancelUrl: `${appUrl}/en/coach-training/${programSlug}?payment=cancelled`,
        metadata: { user_id: user.id, type: 'program' },
      });
      return NextResponse.json({ success: true, status: 'enrolled', checkoutUrl: session.url });
    }

    return NextResponse.json({ success: true, status: 'enrolled' });
  } catch (err) {
    console.error('Program enrollment error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}
