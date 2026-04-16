import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/waitlist/all  — all waitlist entries across all events
export async function GET() {
  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from('event_waitlist')
    .select('*')
    .order('event_id', { ascending: true })
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
