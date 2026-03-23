'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { GalleryManager } from '@/components/admin/GalleryManager';
import type { Event } from '@/types/database';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch(`/api/admin/data?table=events&id=${id}`)
      .then(r => r.json()).then(d => { setEvent(d as Event | null); setImageUrl((d as Event)?.image_url || ''); setDescription((d as Event)?.description_en || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/data', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'events', id, data: {
        title_en: fd.get('title_en'), title_de: fd.get('title_de') || null,
        brief_description_en: fd.get('brief_description_en') || null,
        description_en: fd.get('description_en') || null,
        start_date: fd.get('start_date') || null, end_date: fd.get('end_date') || null,
        location: fd.get('location') || null, image_url: fd.get('image_url') || null,
        is_online: fd.get('is_online') === 'on',
        price: parseFloat(fd.get('price') as string) || null,
        stripe_price_id: fd.get('stripe_price_id') || null,
        max_attendees: parseInt(fd.get('max_attendees') as string) || null,
        is_published: fd.get('is_published') === 'on',
        is_featured: fd.get('is_featured') === 'on',
      }}),
    });
    if (res.ok) router.push('/admin/events');
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
              <Label htmlFor="brief_description_en">Brief Description (English) — for homepage featured event</Label>
              <Textarea id="brief_description_en" name="brief_description_en" rows={3} placeholder="Short description for homepage (optional)" defaultValue={event.brief_description_en || ''} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <input type="hidden" name="description_en" value={description} />
              <RichTextEditor
                value={description || ''}
                onChange={setDescription}
                placeholder="Event description"
              />
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
                <Label>Event Image</Label>
                <input type="hidden" name="image_url" value={imageUrl} />
                <ImageUpload
                  value={imageUrl || null}
                  onChange={setImageUrl}
                  folder="events"
                  label="Event image"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (CHF)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={event.price || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                <Input id="stripe_price_id" name="stripe_price_id" placeholder="price_..." defaultValue={event.stripe_price_id || ''} />
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

      <Card>
        <CardContent className="pt-6">
          <GalleryManager entityType="event" entityId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
