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

  const { table, id, data } = await request.json();

  if (!['event_registrations', 'program_enrollments'].includes(table) || !id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { error } = await admin.from(table).update(data).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
