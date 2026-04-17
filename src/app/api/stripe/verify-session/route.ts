import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';

/**
 * Verifies a completed Stripe Checkout Session and activates the matching record.
 * Called from the success page as a fallback for when webhooks aren't configured.
 * Idempotent — safe to call multiple times.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Security: session must belong to this user
    if (session.metadata?.user_id && session.metadata.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({ success: false, status: session.status });
    }

    const admin = createAdminClient();
    const type = session.metadata?.type;

    if (type === 'membership' && session.mode === 'subscription') {
      const sub = typeof session.subscription === 'object' ? session.subscription : null;
      const endTs = sub && 'current_period_end' in sub && typeof sub.current_period_end === 'number'
        ? sub.current_period_end
        : null;

      await admin
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: session.metadata?.plan || null,
          subscription_end_date: endTs ? new Date(endTs * 1000).toISOString() : null,
          stripe_subscription_id: sub?.id || null,
        })
        .eq('id', user.id);

      return NextResponse.json({ success: true, type: 'membership' });
    }

    if (type === 'event') {
      const eventId = session.metadata?.event_id;
      if (eventId) {
        await admin
          .from('event_registrations')
          .update({ payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      }
      return NextResponse.json({ success: true, type: 'event' });
    }

    if (type === 'program') {
      const programId = session.metadata?.program_id;
      if (programId) {
        await admin
          .from('program_enrollments')
          .update({ payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('program_id', programId)
          .eq('user_id', user.id);
      }
      return NextResponse.json({ success: true, type: 'program' });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('verify-session error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
