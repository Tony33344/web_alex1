'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Option = { value: string; label: string };
type Question = {
  id: string;
  question_key: string;
  question_en: string;
  question_si: string | null;
  help_text_en: string | null;
  help_text_si: string | null;
  question_type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect';
  options: Option[];
  is_required: boolean;
};
type Response = { question_id: string; answer: unknown };

export default function SurveyPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [gdpr, setGdpr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/survey')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setQuestions(d.questions);
        const initial: Record<string, unknown> = {};
        (d.responses as Response[]).forEach((r) => {
          initial[r.question_id] = r.answer;
        });
        setAnswers(initial);
        if (d.gdpr_consent_at) setGdpr(true);
        if (d.survey_completed_at) setSaved(true);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  function setAnswer(qid: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setSaved(false);
  }

  function toggleMulti(qid: string, value: string) {
    const cur = (answers[qid] as string[]) || [];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setAnswer(qid, next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gdpr) {
      setError('Please accept the data processing consent to continue.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = questions
        .map((q) => ({ question_id: q.id, answer: answers[q.id] ?? null }))
        .filter((a) => a.answer !== null && a.answer !== '' && !(Array.isArray(a.answer) && a.answer.length === 0));

      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: payload, gdpr: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading survey…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/members"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Members Area
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 mb-4">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Your personalized plan starts here
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Share a few details so one of our Infinity Role Teachers can design a 1-month plan
              for your body, mind and spirit — on a call that suits you (phone, Zoom, Signal, WhatsApp).
            </p>
          </div>

          {saved && (
            <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-emerald-900 dark:text-emerald-100">Thank you!</p>
                <p className="text-emerald-800 dark:text-emerald-200">
                  Your answers have been saved. One of our teachers will reach out to you within the next few days.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, i) => {
              const label = q.question_en;
              const help = q.help_text_en;
              return (
                <Card key={q.id} className="border-amber-100 dark:border-amber-900/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 shrink-0">{i + 1}.</span>
                      <span>
                        {label}
                        {q.is_required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </CardTitle>
                    {help && <p className="text-sm text-muted-foreground pt-1 pl-6">{help}</p>}
                  </CardHeader>
                  <CardContent className="pl-14">
                    {q.question_type === 'text' && (
                      <input
                        type="text"
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                    {q.question_type === 'number' && (
                      <input
                        type="number"
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                    {q.question_type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={(answers[q.id] as string) || ''}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                    {q.question_type === 'select' && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                              answers[q.id] === opt.value
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                : 'border-input hover:border-amber-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.value}
                              checked={answers[q.id] === opt.value}
                              onChange={() => setAnswer(q.id, opt.value)}
                              className="accent-amber-500"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {q.question_type === 'multiselect' && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {q.options.map((opt) => {
                          const checked = Array.isArray(answers[q.id])
                            ? (answers[q.id] as string[]).includes(opt.value)
                            : false;
                          return (
                            <label
                              key={opt.value}
                              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                                checked
                                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                                  : 'border-input hover:border-amber-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleMulti(q.id, opt.value)}
                                className="accent-amber-500"
                              />
                              <span>{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* GDPR consent */}
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gdpr}
                    onChange={(e) => setGdpr(e.target.checked)}
                    className="mt-1 accent-blue-600"
                  />
                  <span className="text-sm">
                    <span className="flex items-center gap-1 font-medium mb-1">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      I consent to the processing of my personal data
                    </span>
                    <span className="text-muted-foreground">
                      I agree that Infinity Role Teachers / AMS4EVER AG may store and process my answers
                      solely for the purpose of designing a personalized health and wellness plan.
                      I can withdraw consent at any time. See our{' '}
                      <Link href="/privacy" className="underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </span>
                </label>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/members')}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || !gdpr}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
              >
                {saving ? 'Saving…' : saved ? 'Update answers' : 'Save & request my plan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
