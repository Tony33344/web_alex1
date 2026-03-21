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
import type { Testimonial } from '@/types/database';

export default function EditTestimonialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentDe, setContentDe] = useState('');

  useEffect(() => {
    fetch(`/api/admin/data?table=testimonials&id=${id}`)
      .then(r => r.json()).then(d => { const t = d as Testimonial | null; setItem(t); setAuthorPhotoUrl(t?.author_photo_url || ''); setContentEn(t?.content_en || ''); setContentDe(t?.content_de || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/data', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'testimonials', id, data: {
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!item) return <p className="text-destructive">Testimonial not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Testimonial</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="author_name">Author Name *</Label>
                <Input id="author_name" name="author_name" required defaultValue={item.author_name} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_title">Author Title</Label>
                <Input id="author_title" name="author_title" defaultValue={item.author_title || ''} placeholder="e.g. Sunyoga Graduate" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content (English)</Label>
              <input type="hidden" name="content_en" value={contentEn} />
              <RichTextEditor
                value={contentEn || ''}
                onChange={setContentEn}
                placeholder="Testimonial content"
              />
            </div>
            <div className="space-y-2">
              <Label>Content (German)</Label>
              <input type="hidden" name="content_de" value={contentDe} />
              <RichTextEditor
                value={contentDe || ''}
                onChange={setContentDe}
                placeholder="Testimonial content (German)"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={item.rating || 5} />
              </div>
              <div className="space-y-2">
                <Label>Author Photo</Label>
                <input type="hidden" name="author_photo_url" value={authorPhotoUrl} />
                <ImageUpload
                  value={authorPhotoUrl || null}
                  onChange={setAuthorPhotoUrl}
                  folder="testimonials"
                  label="Author photo"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" defaultChecked={item.is_published} className="h-4 w-4 rounded border-input" /> Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_featured" defaultChecked={item.is_featured} className="h-4 w-4 rounded border-input" /> Featured
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/testimonials')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
