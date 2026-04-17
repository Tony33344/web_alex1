'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
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
  is_active: boolean;
  question_order: number;
};

const TYPES: Question['question_type'][] = ['text', 'textarea', 'number', 'select', 'multiselect'];

export default function AdminSurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/survey');
    const d = await r.json();
    setQuestions(Array.isArray(d) ? d : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(q: Question) {
    const res = await fetch('/api/admin/survey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(q),
    });
    if (!res.ok) {
      const d = await res.json();
      alert('Save failed: ' + (d.error || 'unknown'));
      return;
    }
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this question? All member answers to it will also be removed.')) return;
    await fetch('/api/admin/survey', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function addNew() {
    const key = prompt('Short unique key (e.g. "sleep_hours"):');
    if (!key) return;
    const label = prompt('Question text (English):');
    if (!label) return;
    const res = await fetch('/api/admin/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_key: key,
        question_en: label,
        question_type: 'text',
        options: [],
        is_required: false,
        is_active: true,
        question_order: questions.length + 1,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert('Create failed: ' + (d.error || 'unknown'));
      return;
    }
    await load();
  }

  function updateLocal(id: string, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = questions.findIndex((q) => q.id === id);
    const other = idx + dir;
    if (other < 0 || other >= questions.length) return;
    const a = questions[idx];
    const b = questions[other];
    await Promise.all([
      fetch('/api/admin/survey', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: a.id, question_order: b.question_order }),
      }),
      fetch('/api/admin/survey', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, question_order: a.question_order }),
      }),
    ]);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Member Survey</h1>
          <p className="text-muted-foreground">Questions members answer to get a personalized plan</p>
        </div>
        <Button onClick={addNew}>
          <Plus className="h-4 w-4 mr-1" />
          New Question
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No questions yet. Click <strong>New Question</strong> to add one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <Card key={q.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <span className="text-muted-foreground">#{i + 1}</span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{q.question_key}</code>
                  {!q.is_active && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Hidden</span>
                  )}
                </CardTitle>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => move(q.id, -1)} disabled={i === 0}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => move(q.id, 1)} disabled={i === questions.length - 1}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => save({ ...q, is_active: !q.is_active })}
                    title={q.is_active ? 'Hide' : 'Show'}
                  >
                    {q.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(q.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="text-sm space-y-1">
                    <span className="text-muted-foreground">Question (EN)</span>
                    <input
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={q.question_en}
                      onChange={(e) => updateLocal(q.id, { question_en: e.target.value })}
                    />
                  </label>
                  <label className="text-sm space-y-1">
                    <span className="text-muted-foreground">Question (SI)</span>
                    <input
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={q.question_si || ''}
                      onChange={(e) => updateLocal(q.id, { question_si: e.target.value })}
                    />
                  </label>
                  <label className="text-sm space-y-1">
                    <span className="text-muted-foreground">Help text (EN)</span>
                    <input
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={q.help_text_en || ''}
                      onChange={(e) => updateLocal(q.id, { help_text_en: e.target.value })}
                    />
                  </label>
                  <label className="text-sm space-y-1">
                    <span className="text-muted-foreground">Help text (SI)</span>
                    <input
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={q.help_text_si || ''}
                      onChange={(e) => updateLocal(q.id, { help_text_si: e.target.value })}
                    />
                  </label>
                  <label className="text-sm space-y-1">
                    <span className="text-muted-foreground">Type</span>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={q.question_type}
                      onChange={(e) => updateLocal(q.id, { question_type: e.target.value as Question['question_type'] })}
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm space-y-1 flex flex-col justify-end">
                    <span className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={q.is_required}
                        onChange={(e) => updateLocal(q.id, { is_required: e.target.checked })}
                      />
                      Required
                    </span>
                  </label>
                </div>

                {(q.question_type === 'select' || q.question_type === 'multiselect') && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Options (JSON array of {'{value, label}'})</span>
                    <textarea
                      rows={Math.max(3, (q.options?.length || 0) + 1)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                      value={JSON.stringify(q.options, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          if (Array.isArray(parsed)) updateLocal(q.id, { options: parsed });
                        } catch {
                          // ignore parse errors while typing
                        }
                      }}
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => save(q)}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
