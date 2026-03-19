'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types/database';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      setEvent(data as Event | null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const supabase = createClient();
    const { error } = await supabase.from('events').update({
      title_en: fd.get('title_en') as string,
      title_de: fd.get('title_de') as string || null,
      description_en: fd.get('description_en') as string || null,
      start_date: fd.get('start_date') as string,
      end_date: fd.get('end_date') as string || null,
      location: fd.get('location') as string || null,
      image_url: fd.get('image_url') as string || null,
      is_online: fd.get('is_online') === 'on',
      price: parseFloat(fd.get('price') as string) || null,
      max_attendees: parseInt(fd.get('max_attendees') as string) || null,
      is_published: fd.get('is_published') === 'on',
      is_featured: fd.get('is_featured') === 'on',
    }).eq('id', id);

    if (!error) router.push('/admin/events');
    setSaving(false);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!event) return <p className="text-destructive">Event not found.</p>;

  const formatDateLocal = (d: string) => d ? new Date(d).toISOString().slice(0, 16) : '';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Event</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input id="title_en" name="title_en" required defaultValue={event.title_en} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_de">Title (German)</Label>
              <Input id="title_de" name="title_de" defaultValue={event.title_de || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">Description</Label>
              <Textarea id="description_en" name="description_en" rows={4} defaultValue={event.description_en || ''} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input id="start_date" name="start_date" type="datetime-local" required defaultValue={formatDateLocal(event.start_date)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="datetime-local" defaultValue={event.end_date ? formatDateLocal(event.end_date) : ''} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" defaultValue={event.location || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" defaultValue={event.image_url || ''} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (CHF)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={event.price || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Input id="max_attendees" name="max_attendees" type="number" defaultValue={event.max_attendees || ''} />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_online" defaultChecked={event.is_online} className="h-4 w-4 rounded border-input" /> Online Event</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" defaultChecked={event.is_published} className="h-4 w-4 rounded border-input" /> Published</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={event.is_featured} className="h-4 w-4 rounded border-input" /> Featured</label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/events')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
