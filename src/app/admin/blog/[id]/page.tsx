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
import { BLOG_CATEGORIES } from '@/lib/constants';
import type { BlogPost } from '@/types/database';

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single();
      setPost(data as BlogPost | null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const supabase = createClient();
    const { error } = await supabase.from('blog_posts').update({
      title_en: fd.get('title_en') as string,
      title_de: fd.get('title_de') as string || null,
      excerpt_en: fd.get('excerpt_en') as string || null,
      content_en: fd.get('content_en') as string || null,
      category: fd.get('category') as string || null,
      featured_image_url: fd.get('featured_image_url') as string || null,
      is_published: fd.get('is_published') === 'on',
      is_members_only: fd.get('is_members_only') === 'on',
      is_featured: fd.get('is_featured') === 'on',
      reading_time_minutes: parseInt(fd.get('reading_time') as string) || 5,
      published_at: fd.get('is_published') === 'on' && !post?.published_at ? new Date().toISOString() : post?.published_at,
    }).eq('id', id);

    if (!error) router.push('/admin/blog');
    setSaving(false);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!post) return <p className="text-destructive">Blog post not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input id="title_en" name="title_en" required defaultValue={post.title_en} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_de">Title (German)</Label>
              <Input id="title_de" name="title_de" defaultValue={post.title_de || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt_en">Excerpt (English)</Label>
              <Textarea id="excerpt_en" name="excerpt_en" rows={2} defaultValue={post.excerpt_en || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content_en">Content (English)</Label>
              <Textarea id="content_en" name="content_en" rows={12} defaultValue={post.content_en || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured_image_url">Featured Image URL</Label>
              <Input id="featured_image_url" name="featured_image_url" defaultValue={post.featured_image_url || ''} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select id="category" name="category" defaultValue={post.category || ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select category</option>
                  {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading_time">Reading Time (min)</Label>
                <Input id="reading_time" name="reading_time" type="number" defaultValue={post.reading_time_minutes} />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_published" defaultChecked={post.is_published} className="h-4 w-4 rounded border-input" /> Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_featured" defaultChecked={post.is_featured} className="h-4 w-4 rounded border-input" /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_members_only" defaultChecked={post.is_members_only} className="h-4 w-4 rounded border-input" /> Members Only
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/blog')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
