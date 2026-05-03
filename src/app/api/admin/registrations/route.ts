import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();

  const [regs, enrollments] = await Promise.all([
    admin
      .from('event_registrations')
      .select('*, event:events(id, title_en, slug, start_date, price, currency, max_attendees, current_attendees), profile:profiles(email, full_name, phone)')
      .order('created_at', { ascending: false }),
    admin
      .from('program_enrollments')
      .select('*, program:programs(id, name_en, slug, price, currency), profile:profiles(email, full_name, phone)')
      .order('created_at', { ascending: false }),
  ]);

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
  return NextResponse.json({ success: true });
}
