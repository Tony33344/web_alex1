import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

export async function GET() {
  const admin = createAdminClient();

  const [regs, enrollments] = await Promise.all([
    admin
      .from('event_registrations')
      .select('*, event:events(id, title_en, slug, start_date, price, currency, max_attendees, current_attendees), profile:profiles(email, full_name, phone)')
      .order('created_at', { ascending: false }),
    admin
      .from('program_enrollments')
      .select('*, program:programs(id, name_en, slug, price, currency), profile:profiles!program_enrollments_user_id_fkey(email, full_name, phone)')
      .order('created_at', { ascending: false }),
  ]);

  if (enrollments.error) {
    console.error('Program enrollments query error:', enrollments.error.message);
  }
  if (regs.error) {
    console.error('Event registrations query error:', regs.error.message);
  }

  console.log('Admin registrations API response:', {
    eventRegistrationsCount: regs.data?.length || 0,
    programEnrollmentsCount: enrollments.data?.length || 0,
    enrollmentsError: enrollments.error?.message || null,
    regsError: regs.error?.message || null,
  });

  return NextResponse.json({
    eventRegistrations: regs.data ?? [],
    programEnrollments: enrollments.data ?? [],
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { table, id, data, action } = await request.json();

  // Reset event current_attendees count
  if (action === 'reset_count' && table === 'events' && id) {
    const { data: activeRegs } = await admin
      .from('event_registrations')
      .select('id')
      .eq('event_id', id)
      .neq('status', 'cancelled');
    const { error } = await admin
      .from('events')
      .update({ current_attendees: activeRegs?.length || 0 })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count: activeRegs?.length || 0 });
  }

  // Set custom event current_attendees count (for offline registrations)
  if (action === 'set_count' && table === 'events' && id && data?.count !== undefined) {
    const count = parseInt(data.count, 10);
    if (isNaN(count) || count < 0) {
      return NextResponse.json({ error: 'Invalid count value' }, { status: 400 });
    }
    const { error } = await admin
      .from('events')
      .update({ current_attendees: count })
      .eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count });
  }

  // Delete all registrations for an event
  if (action === 'delete_all' && table === 'event_registrations' && id) {
    const { error } = await admin.from('event_registrations').delete().eq('event_id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Also reset the event's current_attendees to 0
    await admin.from('events').update({ current_attendees: 0 }).eq('id', id);
    return NextResponse.json({ success: true });
  }

  if (!['event_registrations', 'program_enrollments'].includes(table) || !id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { error } = await admin.from(table).update(data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send confirmation email when admin marks payment as paid
  if (data?.payment_status === 'paid') {
    try {
      if (table === 'event_registrations') {
        const { data: reg } = await admin
          .from('event_registrations')
          .select('user_id, event:events(id, title_en, start_date, is_online, location)')
          .eq('id', id)
          .single();
        if (reg) {
          const { data: userProfile } = await admin
            .from('profiles')
            .select('full_name, email')
            .eq('id', reg.user_id)
            .single();
          const { data: { user: regUser } } = await admin.auth.admin.getUserById(reg.user_id);
          const recipientEmail = userProfile?.email || regUser?.email;
          // event is returned as relation - typed as any due to Supabase relation typing
          const event = reg.event as unknown as { id: string; title_en: string; start_date: string; is_online: boolean; location: string | null } | null;
          if (recipientEmail && event) {
            const userName = userProfile?.full_name || recipientEmail.split('@')[0] || 'there';
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const eventUrl = `${appUrl}/en/events/${event.id}`;
            const emailContent = prepareEmail({
              to: recipientEmail,
              subject: 'Event Registration Confirmed',
              template: EmailTemplates.EVENT_REGISTRATION,
              variables: {
                user_name: userName,
                event_title: event.title_en || 'Event',
                event_date: event.start_date ? new Date(event.start_date).toLocaleDateString('en', { dateStyle: 'long' }) : 'TBA',
                event_time: event.start_date ? new Date(event.start_date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
                event_location: event.is_online ? 'Online' : (event.location || 'TBA'),
                event_url: eventUrl,
                calendar_url: eventUrl,
                order_id: `EVT-${id.substring(0, 8).toUpperCase()}`,
              },
            });
            await sendEmail({ to: recipientEmail, subject: emailContent.subject, html: emailContent.html });
          }
        }
      } else if (table === 'program_enrollments') {
        const { data: enr } = await admin
          .from('program_enrollments')
          .select('user_id, program:programs(id, name_en, slug, duration, start_date, location, max_participants, price, currency)')
          .eq('id', id)
          .single();
        if (enr) {
          const { data: userProfile } = await admin
            .from('profiles')
            .select('full_name, email')
            .eq('id', enr.user_id)
            .single();
          const { data: { user: enrUser } } = await admin.auth.admin.getUserById(enr.user_id);
          const recipientEmail = userProfile?.email || enrUser?.email;
          const program = enr.program as unknown as { id: string; name_en: string; slug: string; duration: string | null; start_date: string | null; location: string | null; max_participants: number | null; price: number | null; currency: string | null } | null;
          if (recipientEmail && program) {
            const userName = userProfile?.full_name || recipientEmail.split('@')[0] || 'there';
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const programUrl = `${appUrl}/coach-training/${program.slug}`;
            const emailVariables = {
              user_name: userName,
              program_name: program.name_en || 'Program',
              order_id: `PRG-${id.substring(0, 8).toUpperCase()}`,
              program_duration: program.duration || 'TBA',
              start_date: program.start_date ? new Date(program.start_date).toLocaleDateString('en', { dateStyle: 'long' }) : 'TBA',
              program_time: program.start_date ? new Date(program.start_date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'TBA',
              location: program.location || 'TBA',
              max_participants: program.max_participants?.toString() || 'TBA',
              payment_amount: program.price ? `${program.currency || 'CHF'} ${program.price}` : 'TBA',
              program_url: programUrl,
            };
            console.log('Program enrollment email variables:', emailVariables);
            const emailContent = prepareEmail({
              to: recipientEmail,
              subject: 'Program Enrollment Confirmed',
              template: EmailTemplates.COACH_TRAINING_REGISTRATION,
              variables: emailVariables,
            });
            await sendEmail({ to: recipientEmail, subject: emailContent.subject, html: emailContent.html });
          }
        }
      }
    } catch (emailError) {
      console.error('Failed to send confirmation email after marking paid:', emailError);
      // Don't fail the request if email fails
    }
  }

  return NextResponse.json({ success: true });
}
