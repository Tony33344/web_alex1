import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/client';

/**
 * Verifies a Stripe Checkout Session and activates the matching record.
 * Idempotent — safe to call multiple times.
 * Returns true if session was valid and processed.
 */
export async function verifyAndActivateSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Security: session must belong to this user
    if (session.metadata?.user_id && session.metadata.user_id !== userId) {
      console.error('verify-session: user mismatch');
      return false;
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return false;
    }

    const admin = createAdminClient();
    const type = session.metadata?.type;

    if (type === 'membership' && session.mode === 'subscription') {
      const sub = typeof session.subscription === 'object' ? session.subscription : null;
      const endTs = sub && 'current_period_end' in sub && typeof sub.current_period_end === 'number'
        ? sub.current_period_end
        : null;

      const { error } = await admin
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_plan: session.metadata?.plan || null,
          subscription_end_date: endTs ? new Date(endTs * 1000).toISOString() : null,
        })
        .eq('id', userId);

      if (error) {
        console.error('verify-session: profile update error', error);
        return false;
      }
      return true;
    }

    if (type === 'event') {
      const eventId = session.metadata?.event_id;
      if (eventId) {
        await admin
          .from('event_registrations')
          .update({ payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('event_id', eventId)
          .eq('user_id', userId);
      }
      return true;
    }

    if (type === 'program') {
      const programId = session.metadata?.program_id;
      if (programId) {
        await admin
          .from('program_enrollments')
          .update({ payment_status: 'paid', status: 'confirmed', confirmed_at: new Date().toISOString() })
          .eq('program_id', programId)
          .eq('user_id', userId);
      }
      return true;
    }

    return true;
  } catch (err) {
    console.error('verify-session error:', err);
    return false;
  }
}
