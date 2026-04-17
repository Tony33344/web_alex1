import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all members (users with active or pending subscriptions)
    const { data: members } = await admin
      .from('profiles')
      .select('id, full_name, email, subscription_status, subscription_plan, subscription_end_date, created_at, phone, survey_completed_at')
      .not('subscription_status', 'is', null)
      .order('created_at', { ascending: false });

    return NextResponse.json({ members: members || [] });
  } catch (err) {
    console.error('Error fetching members:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
