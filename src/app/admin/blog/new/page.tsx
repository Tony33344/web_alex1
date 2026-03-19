'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BLOG_CATEGORIES } from '@/lib/constants';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const slug = (fd.get('title_en') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'blog_posts', data: {
        slug,
        title_en: fd.get('title_en'), title_de: fd.get('title_de') || null,
        excerpt_en: fd.get('excerpt_en') || null, content_en: fd.get('content_en') || null,
        category: fd.get('category') || null,
        is_published: fd.get('is_published') === 'on',
        is_members_only: fd.get('is_members_only') === 'on',
        is_featured: fd.get('is_featured') === 'on',
        reading_time_minutes: parseInt(fd.get('reading_time') as string) || 5,
        published_at: fd.get('is_published') === 'on' ? new Date().toISOString() : null,
      }}),
    });
    if (res.ok) router.push('/admin/blog');
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Blog Post</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input id="title_en" name="title_en" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_de">Title (German)</Label>
              <Input id="title_de" name="title_de" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt_en">Excerpt (English)</Label>
              <Textarea id="excerpt_en" name="excerpt_en" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_en">Content (English)</Label>
              <Textarea id="content_en" name="content_en" rows={12} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading_time">Reading Time (min)</Label>
                <Input id="reading_time" name="reading_time" type="number" defaultValue="5" />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" className="h-4 w-4 rounded border-input" /> Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_featured" className="h-4 w-4 rounded border-input" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_members_only" className="h-4 w-4 rounded border-input" /> Members Only
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Post
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
