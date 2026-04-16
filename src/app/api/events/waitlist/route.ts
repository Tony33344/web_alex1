import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const adminSupabase = createAdminClient();
    const { eventId, name, email, phone } = await request.json();

    if (!eventId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields: eventId, name, email' }, { status: 400 });
    }

    // Get event
    const { data: event } = await adminSupabase
      .from('events')
      .select('id, max_attendees, current_attendees')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if already on waitlist with this email
    const { data: existing } = await adminSupabase
      .from('event_waitlist')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email.toLowerCase())
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'This email is already on the waitlist for this event.' }, { status: 409 });
    }

    // Detect logged-in user and their membership status
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId: string | null = null;
    let participantType: 'member' | 'registered_user' | 'guest' = 'guest';

    if (user) {
      userId = user.id;
      // Check if user has an active membership
      const { data: membership } = await adminSupabase
        .from('user_memberships')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      participantType = membership ? 'member' : 'registered_user';
    }

    const { data: entry, error } = await adminSupabase
      .from('event_waitlist')
      .insert({
        event_id: eventId,
        user_id: userId,
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        participant_type: participantType,
        status: 'waiting',
      })
      .select('id, position')
      .single();

    if (error) {
      console.error('Waitlist insert error:', error.message);
      return NextResponse.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true, position: entry.position, participantType });
  } catch (err) {
    console.error('Waitlist error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
