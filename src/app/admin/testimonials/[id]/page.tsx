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
import type { Testimonial } from '@/types/database';

export default function EditTestimonialPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('testimonials').select('*').eq('id', id).single();
      setItem(data as Testimonial | null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const supabase = createClient();
    const { error } = await supabase.from('testimonials').update({
      author_name: fd.get('author_name') as string,
      author_title: fd.get('author_title') as string || null,
      content_en: fd.get('content_en') as string,
      content_de: fd.get('content_de') as string || null,
      rating: parseInt(fd.get('rating') as string) || 5,
      author_photo_url: fd.get('author_photo_url') as string || null,
      is_published: fd.get('is_published') === 'on',
      is_featured: fd.get('is_featured') === 'on',
    }).eq('id', id);

    if (!error) router.push('/admin/testimonials');
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
              <Label htmlFor="content_en">Content (English) *</Label>
              <Textarea id="content_en" name="content_en" rows={4} required defaultValue={item.content_en} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_de">Content (German)</Label>
              <Textarea id="content_de" name="content_de" rows={4} defaultValue={item.content_de || ''} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={item.rating || 5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_photo_url">Author Photo URL</Label>
                <Input id="author_photo_url" name="author_photo_url" defaultValue={item.author_photo_url || ''} />
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
