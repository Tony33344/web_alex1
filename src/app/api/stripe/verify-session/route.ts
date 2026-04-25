import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAndActivateSession } from '@/lib/stripe/verify-session';

/**
 * Verifies a completed Stripe Checkout Session and activates the matching record.
 * Called from the success page as a fallback for when webhooks aren't configured.
 * Idempotent — safe to call multiple times.
 * This version uses verifyAndActivateSession which also sends confirmation emails.
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

    console.log('verify-session API: calling verifyAndActivateSession for user', user.id);

    const success = await verifyAndActivateSession(sessionId, user.id);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Session verification failed' }, { status: 400 });
    }
  } catch (err) {
    console.error('verify-session API error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
