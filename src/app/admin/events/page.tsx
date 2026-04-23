'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/types/database';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=events&orderBy=start_date&orderDir=asc')
      .then(r => r.json()).then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublish(id: string, current: boolean) {
    await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'events', id, data: { is_published: !current } }) });
    setEvents(events.map(e => e.id === id ? { ...e, is_published: !current } : e));
  }

  async function deleteEvent(id: string) {
    if (!confirm('Delete this event?')) return;
    await fetch('/api/admin/data', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'events', id }) });
    setEvents(events.filter(e => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Manage events, workshops, and retreats</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2"><Plus className="h-4 w-4" />New Event</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : events.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No events yet. Create your first event.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{event.title_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={event.is_published ? 'default' : 'secondary'}>
                      {event.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    {event.is_featured && <Badge variant="outline">Featured</Badge>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.start_date).toLocaleDateString()}</span>
                    <span>{event.current_attendees}/{event.max_attendees ?? '∞'} attendees</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(event.id, event.is_published)}>
                    {event.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => deleteEvent(event.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
