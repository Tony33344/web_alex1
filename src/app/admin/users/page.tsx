'use client';

import { useEffect, useState } from 'react';
import { Shield, ShieldCheck, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Profile } from '@/types/database';

type SurveyAnswer = { question_id: string; answer: unknown };
type Question = { id: string; question_key: string; question_en: string; question_type: string; options: { value: string; label: string }[] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [surveyModal, setSurveyModal] = useState<{ userId: string; userName: string } | null>(null);
  const [surveyData, setSurveyData] = useState<{ questions: Question[]; answers: SurveyAnswer[] } | null>(null);
  const [surveyLoading, setSurveyLoading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data as Profile[] : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleAdmin(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role: newRole }) });
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole as Profile['role'] } : u));
  }

  async function openSurvey(userId: string, userName: string) {
    setSurveyModal({ userId, userName });
    setSurveyData(null);
    setSurveyLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        fetch('/api/admin/survey'),
        fetch(`/api/admin/survey/answers?userId=${userId}`),
      ]);
      const questions = await qRes.json();
      const answers = await aRes.json();
      setSurveyData({ questions: Array.isArray(questions) ? questions : [], answers: answers.answers || [] });
    } catch (e) {
      console.error(e);
    } finally {
      setSurveyLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">{users.length} registered users</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{user.full_name || 'No name'}</span>
                    <Badge variant={user.role === 'admin' || user.role === 'super_admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                    <Badge variant={user.subscription_status === 'active' ? 'default' : 'outline'}>{user.subscription_status}</Badge>
                    {user.survey_completed_at && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Survey done
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {user.survey_completed_at && (
                    <Button variant="outline" size="sm" onClick={() => openSurvey(user.id, user.full_name || user.email || 'User')}>
                      <FileText className="h-4 w-4 mr-1" />
                      Survey
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
                  {user.role !== 'super_admin' && (
                    <Button variant="ghost" size="sm" onClick={() => toggleAdmin(user.id, user.role)} title={user.role === 'admin' ? 'Remove admin' : 'Make admin'}>
                      {user.role === 'admin' ? <ShieldCheck className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Survey Modal */}
      <Dialog open={!!surveyModal} onOpenChange={(open) => { if (!open) setSurveyModal(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {surveyModal?.userName} — Survey Answers
            </DialogTitle>
          </DialogHeader>
          {surveyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : surveyData ? (
            <div className="space-y-4">
              {surveyData.questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No survey questions found.</p>
              ) : (
                surveyData.questions.map((q) => {
                  const ans = surveyData.answers.find((a) => a.question_id === q.id);
                  const answer = ans?.answer;
                  let display: string = '—';
                  if (answer == null) {
                    display = '—';
                  } else if (Array.isArray(answer)) {
                    const labels = answer
                      .map((v: string) => q.options.find((o) => o.value === v)?.label || v)
                      .filter(Boolean);
                    display = labels.length > 0 ? labels.join(', ') : '—';
                  } else if (typeof answer === 'string') {
                    if (q.question_type === 'select') {
                      const opt = q.options.find((o) => o.value === answer);
                      display = opt?.label || answer;
                    } else {
                      display = answer;
                    }
                  } else if (typeof answer === 'number') {
                    display = String(answer);
                  }
                  return (
                    <div key={q.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium text-sm mb-1">{q.question_en}</p>
                      <p className="text-sm text-muted-foreground">{display}</p>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Failed to load survey data.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
