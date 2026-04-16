'use client';

import { useEffect, useState } from 'react';
import { Bell, Trash2, CheckCircle, Clock, UserCheck, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WaitlistEntry } from '@/types/database';

const PARTICIPANT_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  member: { label: 'Member', variant: 'default' },
  registered_user: { label: 'Registered', variant: 'secondary' },
  guest: { label: 'Guest', variant: 'outline' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  waiting: <Clock className="h-3 w-3" />,
  notified: <Bell className="h-3 w-3" />,
  confirmed: <CheckCircle className="h-3 w-3" />,
  cancelled: <Trash2 className="h-3 w-3" />,
};

export function WaitlistManager({ eventId }: { eventId: string }) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadWaitlist();
  }, [eventId]);

  async function loadWaitlist() {
    setLoading(true);
    const res = await fetch(`/api/admin/waitlist?eventId=${eventId}`);
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch('/api/admin/waitlist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: status as WaitlistEntry['status'] } : e));
    setUpdating(null);
  }

  async function removeEntry(id: string) {
    if (!confirm('Remove this person from the waitlist?')) return;
    setUpdating(id);
    await fetch(`/api/admin/waitlist?id=${id}`, { method: 'DELETE' });
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: 'cancelled' } : e));
    setUpdating(null);
  }

  const active = entries.filter((e) => e.status !== 'cancelled');
  const cancelled = entries.filter((e) => e.status === 'cancelled');

  if (loading) return <p className="text-sm text-muted-foreground">Loading waitlist...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Waiting List</h3>
          <Badge variant="secondary">{active.length} active</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={loadWaitlist}>Refresh</Button>
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">No one on the waiting list yet.</p>
      ) : (
        <div className="space-y-2">
          {active.map((entry) => {
            const ptInfo = PARTICIPANT_LABELS[entry.participant_type] || PARTICIPANT_LABELS.guest;
            return (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-muted-foreground text-sm font-mono w-6 shrink-0">#{entry.position}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{entry.email}{entry.phone ? ` · ${entry.phone}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={ptInfo.variant} className="text-xs gap-1">
                    {entry.participant_type === 'member' ? <UserCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                    {ptInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1 capitalize">
                    {STATUS_ICONS[entry.status]}
                    {entry.status}
                  </Badge>
                  {entry.status === 'waiting' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      disabled={updating === entry.id}
                      onClick={() => updateStatus(entry.id, 'notified')}
                    >
                      <Bell className="h-3 w-3" /> Notify
                    </Button>
                  )}
                  {entry.status === 'notified' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-primary"
                      disabled={updating === entry.id}
                      onClick={() => updateStatus(entry.id, 'confirmed')}
                    >
                      <CheckCircle className="h-3 w-3" /> Confirm
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-destructive hover:text-destructive"
                    disabled={updating === entry.id}
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelled.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">{cancelled.length} cancelled entries</summary>
          <div className="mt-2 space-y-1">
            {cancelled.map((e) => (
              <p key={e.id} className="pl-2 line-through">{e.name} — {e.email}</p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
