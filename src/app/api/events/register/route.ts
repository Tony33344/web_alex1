import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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
      .select('id, max_attendees, current_attendees, price')
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
    const status = isFull ? 'waitlisted' : 'registered';
    const paymentStatus = (!event.price || event.price === 0) ? 'free' : 'pending';

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

    return NextResponse.json({ success: true, status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
