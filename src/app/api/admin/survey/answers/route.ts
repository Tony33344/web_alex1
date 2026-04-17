import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const admin = createAdminClient();
  const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!me || (me.role !== 'admin' && me.role !== 'super_admin')) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { admin };
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const { data, error } = await auth.admin
    .from('survey_responses')
    .select('question_id, answer')
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ answers: data || [] });
}
