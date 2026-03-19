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

    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    const { data: event } = await adminSupabase
      .from('events')
      .select('id, title_en, max_attendees, current_attendees, price, currency, stripe_price_id')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const { data: existing } = await adminSupabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already registered' }, { status: 409 });
    }

    const isFull = event.max_attendees && event.current_attendees >= event.max_attendees;
    const isFree = !event.price || event.price <= 0;
    const status = isFull ? 'waitlisted' : 'registered';
    const paymentStatus = isFree ? 'free' : 'pending';

    // Insert registration
    const { error } = await adminSupabase.from('event_registrations').insert({
      event_id: eventId,
      user_id: user.id,
      status,
      payment_status: paymentStatus,
    });

    if (error) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }

    if (!isFull) {
      await adminSupabase
        .from('events')
        .update({ current_attendees: event.current_attendees + 1 })
        .eq('id', eventId);
    }

    // For paid events, create Stripe checkout session
    if (!isFree && !isFull) {
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

      if (event.stripe_price_id) {
        const session = await createCheckoutSession({
          customerId,
          priceId: event.stripe_price_id,
          mode: 'payment',
          successUrl: `${appUrl}/en/events?payment=success`,
          cancelUrl: `${appUrl}/en/events?payment=cancelled`,
          metadata: { user_id: user.id, event_id: eventId, type: 'event' },
        });
        return NextResponse.json({ success: true, status, checkoutUrl: session.url });
      }

      // No stripe_price_id set — return pending status, admin can handle manually
      return NextResponse.json({ success: true, status, paymentPending: true });
    }

    return NextResponse.json({ success: true, status });
  } catch (err) {
    console.error('Event registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
