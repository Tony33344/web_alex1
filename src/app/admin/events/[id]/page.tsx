'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { WaitlistManager } from '@/components/admin/WaitlistManager';
import type { Event } from '@/types/database';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [longContent, setLongContent] = useState('');
  const [showLongContent, setShowLongContent] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/data?table=events&id=${id}`)
      .then(r => r.json()).then(d => { setEvent(d as Event | null); setImageUrl((d as Event)?.image_url || ''); setDescription((d as Event)?.description_en || ''); setLongContent((d as Event)?.long_content_en || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const payload = {
      title_en: fd.get('title_en'),
      title_de: fd.get('title_de') || null,
      title_it: fd.get('title_it') || null,
      title_fr: fd.get('title_fr') || null,
      title_hi: fd.get('title_hi') || null,
      title_si: fd.get('title_si') || null,
      description_en: description || null,
      description_de: fd.get('description_de') || null,
      description_it: fd.get('description_it') || null,
      description_fr: fd.get('description_fr') || null,
      description_hi: fd.get('description_hi') || null,
      description_si: fd.get('description_si') || null,
      long_content_en: longContent || null,
      long_content_de: fd.get('long_content_de') || null,
      long_content_it: fd.get('long_content_it') || null,
      long_content_fr: fd.get('long_content_fr') || null,
      long_content_hi: fd.get('long_content_hi') || null,
      long_content_si: fd.get('long_content_si') || null,
      start_date: fd.get('start_date') || null,
      end_date: fd.get('end_date') || null,
      location: fd.get('location') || null,
      image_url: fd.get('image_url') || null,
      is_online: fd.get('is_online') === 'on',
      price: parseFloat(fd.get('price') as string) || null,
      stripe_price_id: fd.get('stripe_price_id') || null,
      early_bird_price: parseFloat(fd.get('early_bird_price') as string) || null,
      early_bird_deadline: fd.get('early_bird_deadline') || null,
      early_bird_stripe_price_id: fd.get('early_bird_stripe_price_id') || null,
      max_attendees: parseInt(fd.get('max_attendees') as string) || null,
      is_published: fd.get('is_published') === 'on',
      is_featured: fd.get('is_featured') === 'on',
    };
    console.log('PATCH payload:', { table: 'events', id, data: payload });

    const res = await fetch('/api/admin/data', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'events', id, data: payload }),
    });
    const result = await res.json();
    console.log('PATCH response:', res.status, result);
    if (res.ok) {
      toast.success('Event saved successfully');
      router.push('/admin/events');
    } else {
      toast.error(result.error || 'Failed to save event');
    }
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="title_en">Title (English) *</Label>
                <Input id="title_en" name="title_en" required defaultValue={event.title_en} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_de">Title (German)</Label>
                <Input id="title_de" name="title_de" defaultValue={event.title_de || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_it">Title (Italian)</Label>
                <Input id="title_it" name="title_it" defaultValue={event.title_it || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_fr">Title (French)</Label>
                <Input id="title_fr" name="title_fr" defaultValue={event.title_fr || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_hi">Title (Hindi)</Label>
                <Input id="title_hi" name="title_hi" defaultValue={event.title_hi || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_si">Title (Slovenian)</Label>
                <Input id="title_si" name="title_si" defaultValue={event.title_si || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Short Description (English)</Label>
              <input type="hidden" name="description_en" value={description} />
              <RichTextEditor
                value={description || ''}
                onChange={setDescription}
                placeholder="Brief event description"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description_de">Short Description (German)</Label>
                <Textarea id="description_de" name="description_de" rows={4} defaultValue={event.description_de || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_it">Short Description (Italian)</Label>
                <Textarea id="description_it" name="description_it" rows={4} defaultValue={event.description_it || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_fr">Short Description (French)</Label>
                <Textarea id="description_fr" name="description_fr" rows={4} defaultValue={event.description_fr || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_hi">Short Description (Hindi)</Label>
                <Textarea id="description_hi" name="description_hi" rows={4} defaultValue={event.description_hi || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_si">Short Description (Slovenian)</Label>
                <Textarea id="description_si" name="description_si" rows={4} defaultValue={event.description_si || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowLongContent(!showLongContent)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {showLongContent ? '▼' : '▶'} Full Content (Long Description - English)
              </button>
              {showLongContent && (
                <>
                  <input type="hidden" name="long_content_en" value={longContent} />
                  <RichTextEditor
                    value={longContent || ''}
                    onChange={setLongContent}
                    placeholder="Full event content - this will appear on the event detail page"
                  />
                </>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="long_content_de">Full Content (German)</Label>
                <Textarea id="long_content_de" name="long_content_de" rows={8} defaultValue={event.long_content_de || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_it">Full Content (Italian)</Label>
                <Textarea id="long_content_it" name="long_content_it" rows={8} defaultValue={event.long_content_it || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_fr">Full Content (French)</Label>
                <Textarea id="long_content_fr" name="long_content_fr" rows={8} defaultValue={event.long_content_fr || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_hi">Full Content (Hindi)</Label>
                <Textarea id="long_content_hi" name="long_content_hi" rows={8} defaultValue={event.long_content_hi || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_si">Full Content (Slovenian)</Label>
                <Textarea id="long_content_si" name="long_content_si" rows={8} defaultValue={event.long_content_si || ''} />
              </div>
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
            <div className="rounded-lg border-2 border-amber-300/40 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20 space-y-3">
              <div>
                <Label className="text-amber-900 dark:text-amber-200">Early-bird discount <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
                <p className="text-xs text-muted-foreground">If set and the deadline is still in the future, visitors see the discounted price with a strikethrough original.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="early_bird_price" className="text-xs">Early-bird price</Label>
                  <Input id="early_bird_price" name="early_bird_price" type="number" step="0.01" defaultValue={event.early_bird_price ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="early_bird_deadline" className="text-xs">Deadline</Label>
                  <Input id="early_bird_deadline" name="early_bird_deadline" type="datetime-local" defaultValue={event.early_bird_deadline ? event.early_bird_deadline.slice(0, 16) : ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="early_bird_stripe_price_id" className="text-xs">Stripe Price ID (early-bird)</Label>
                  <Input id="early_bird_stripe_price_id" name="early_bird_stripe_price_id" placeholder="price_..." defaultValue={event.early_bird_stripe_price_id || ''} />
                </div>
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

      <Card>
        <CardContent className="pt-6">
          <WaitlistManager eventId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
