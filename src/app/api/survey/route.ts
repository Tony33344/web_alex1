import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: active questions + current user's answers
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: questions } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('is_active', true)
    .order('question_order');

  const { data: responses } = await supabase
    .from('survey_responses')
    .select('question_id, answer')
    .eq('user_id', user.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('gdpr_consent_at, survey_completed_at')
    .eq('id', user.id)
    .single();

  return NextResponse.json({
    questions: questions || [],
    responses: responses || [],
    gdpr_consent_at: profile?.gdpr_consent_at ?? null,
    survey_completed_at: profile?.survey_completed_at ?? null,
  });
}

// POST: save answers + gdpr consent
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { answers, gdpr } = await request.json();
  if (!gdpr) {
    return NextResponse.json({ error: 'GDPR consent required' }, { status: 400 });
  }
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
  }

  const admin = createAdminClient();

  // Upsert every answered question (wipe empty ones)
  const rows = answers
    .filter((a: { question_id: string; answer: unknown }) => a && a.question_id)
    .map((a: { question_id: string; answer: unknown }) => ({
      user_id: user.id,
      question_id: a.question_id,
      answer: a.answer ?? null,
      updated_at: new Date().toISOString(),
    }));

  if (rows.length > 0) {
    const { error } = await admin
      .from('survey_responses')
      .upsert(rows, { onConflict: 'user_id,question_id' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin
    .from('profiles')
    .update({
      gdpr_consent_at: new Date().toISOString(),
      survey_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  return NextResponse.json({ success: true });
}
