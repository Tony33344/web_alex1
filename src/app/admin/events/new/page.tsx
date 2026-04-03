'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [longContent, setLongContent] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const slug = (fd.get('title_en') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'events', data: {
        slug, title_en: fd.get('title_en'),
        description_en: description || null,
        long_content_en: longContent || null,
        start_date: fd.get('start_date') || null,
        end_date: fd.get('end_date') || null,
        location: fd.get('location') || null,
        image_url: fd.get('image_url') || null,
        is_online: fd.get('is_online') === 'on',
        price: parseFloat(fd.get('price') as string) || null,
        stripe_price_id: fd.get('stripe_price_id') || null,
        max_attendees: parseInt(fd.get('max_attendees') as string) || null,
        is_published: fd.get('is_published') === 'on',
        is_featured: fd.get('is_featured') === 'on',
      }}),
    });
    if (res.ok) {
      toast.success('Event created successfully');
      router.push('/admin/events');
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed to create event');
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Event</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input id="title_en" name="title_en" required />
            </div>
            <div className="space-y-2">
              <Label>Short Description</Label>
              <input type="hidden" name="description_en" value={description} />
              <RichTextEditor
                value={description || ''}
                onChange={setDescription}
                placeholder="Brief event description"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Content (Long Description)</Label>
              <input type="hidden" name="long_content_en" value={longContent} />
              <RichTextEditor
                value={longContent || ''}
                onChange={setLongContent}
                placeholder="Full event content - this will appear on the event detail page"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input id="start_date" name="start_date" type="datetime-local" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="datetime-local" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" />
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
                <Input id="price" name="price" type="number" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                <Input id="stripe_price_id" name="stripe_price_id" placeholder="price_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Input id="max_attendees" name="max_attendees" type="number" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_online" className="h-4 w-4 rounded border-input" /> Online Event</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_published" className="h-4 w-4 rounded border-input" /> Published</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" className="h-4 w-4 rounded border-input" /> Featured</label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Event</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/events')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
