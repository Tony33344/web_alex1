import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan;
      const type = session.metadata?.type;
      const eventId = session.metadata?.event_id;
      const programId = session.metadata?.program_id;
      const message = session.metadata?.message;

      // Subscription payment (membership)
      if ((type === 'membership' || !type) && userId && session.subscription) {
        const subResponse = await stripe.subscriptions.retrieve(session.subscription as string);
        const sub = subResponse as unknown as { current_period_end: number };
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: plan || 'monthly',
            subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      // One-time event payment
      if (type === 'event' && userId && eventId) {
        await supabase
          .from('event_registrations')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent as string || null,
            confirmed_at: new Date().toISOString(),
          })
          .eq('event_id', eventId)
          .eq('user_id', userId);
      }

      // One-time program payment
      if (type === 'program' && userId && programId) {
        await supabase
          .from('program_enrollments')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            stripe_payment_intent_id: session.payment_intent as string || null,
            confirmed_at: new Date().toISOString(),
          })
          .eq('program_id', programId)
          .eq('user_id', userId);
      }

      // One-time donation payment
      if (type === 'donation' && userId) {
        await supabase
          .from('donations')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string || null,
            paid_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        const status = subscription.status === 'active' ? 'active' :
          subscription.status === 'past_due' ? 'past_due' :
          subscription.status === 'canceled' ? 'cancelled' : 'inactive';

        const sub = subscription as unknown as { current_period_end: number };
        await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'cancelled',
            subscription_plan: null,
            subscription_end_date: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
