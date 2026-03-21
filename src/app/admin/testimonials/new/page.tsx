'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function NewTestimonialPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'testimonials', data: {
        author_name: fd.get('author_name'), author_title: fd.get('author_title') || null,
        content_en: fd.get('content_en'), content_de: fd.get('content_de') || null,
        rating: parseInt(fd.get('rating') as string) || 5,
        author_photo_url: fd.get('author_photo_url') || null,
        is_published: fd.get('is_published') === 'on',
        is_featured: fd.get('is_featured') === 'on',
      }}),
    });
    if (res.ok) router.push('/admin/testimonials');
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Testimonial</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="author_name">Author Name *</Label>
                <Input id="author_name" name="author_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_title">Author Title</Label>
                <Input id="author_title" name="author_title" placeholder="e.g. Sunyoga Graduate" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_en">Content (English) *</Label>
              <Textarea id="content_en" name="content_en" rows={4} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_de">Content (German)</Label>
              <Textarea id="content_de" name="content_de" rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue="5" />
              </div>
              <div className="space-y-2">
                <Label>Author Photo</Label>
                <input type="hidden" name="author_photo_url" value={photoUrl} />
                <ImageUpload
                  value={photoUrl || null}
                  onChange={setPhotoUrl}
                  folder="testimonials"
                  label="Author photo"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" defaultChecked className="h-4 w-4 rounded border-input" /> Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_featured" className="h-4 w-4 rounded border-input" /> Featured
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Testimonial</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/testimonials')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
