import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

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

    // Send waitlist confirmation email
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { data: event } = await adminSupabase
        .from('events')
        .select('title_en, start_date, is_online, location')
        .eq('id', eventId)
        .single();

      if (event) {
        const eventUrl = `${appUrl}/en/events/${eventId}`;
        
        const emailContent = prepareEmail({
          to: email.toLowerCase(),
          subject: 'Waitlist Confirmation',
          template: EmailTemplates.EVENT_WAITLIST_CONFIRMATION,
          variables: {
            user_name: name,
            event_title: event.title_en || 'Event',
            event_date: event.start_date ? new Date(event.start_date).toLocaleDateString('en', { dateStyle: 'long' }) : 'TBA',
            event_time: event.start_date ? new Date(event.start_date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
            event_location: event.is_online ? 'Online' : (event.location || 'TBA'),
            position: entry.position.toString(),
            event_url: eventUrl,
          },
        });

        await sendEmail({
          to: email.toLowerCase(),
          subject: emailContent.subject,
          html: emailContent.html,
        });
      }
    } catch (emailError) {
      console.error('Failed to send waitlist confirmation email:', emailError);
      // Don't fail the waitlist join if email fails
    }

    return NextResponse.json({ success: true, position: entry.position, participantType });
  } catch (err) {
    console.error('Waitlist error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
