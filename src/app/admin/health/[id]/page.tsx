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
import type { HealthCategory } from '@/types/database';

export default function EditHealthCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [category, setCategory] = useState<HealthCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [longContent, setLongContent] = useState('');

  useEffect(() => {
    fetch(`/api/admin/data?table=health_categories&id=${id}`)
      .then(r => r.json()).then(d => { const cat = d as HealthCategory | null; setCategory(cat); setCoverUrl(cat?.cover_image_url || ''); setDescription(cat?.description_en || ''); setLongContent(cat?.long_content_en || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/data', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'health_categories', id, data: {
        name_en: fd.get('name_en'), name_de: fd.get('name_de') || null,
        description_en: fd.get('description_en') || null,
        long_content_en: fd.get('long_content_en') || null,
        icon_name: fd.get('icon_name') || null,
        cover_image_url: fd.get('cover_image_url') || null,
        is_active: fd.get('is_active') === 'on',
      }}),
    });
    if (res.ok) router.push('/admin/health');
    setSaving(false);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!category) return <p className="text-destructive">Health category not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Health Category</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English) *</Label>
                <Input id="name_en" name="name_en" required defaultValue={category.name_en} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_de">Name (German)</Label>
                <Input id="name_de" name="name_de" defaultValue={category.name_de || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <input type="hidden" name="description_en" value={description} />
              <RichTextEditor
                value={description || ''}
                onChange={setDescription}
                placeholder="Health category description"
              />
            </div>
            <div className="space-y-2">
              <Label>Long Content (English)</Label>
              <input type="hidden" name="long_content_en" value={longContent} />
              <RichTextEditor
                value={longContent || ''}
                onChange={setLongContent}
                placeholder="Detailed health content"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icon Name</Label>
                <Input id="icon_name" name="icon_name" defaultValue={category.icon_name || ''} placeholder="e.g. Heart, Sun, Brain" />
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <input type="hidden" name="cover_image_url" value={coverUrl} />
                <ImageUpload
                  value={coverUrl || null}
                  onChange={setCoverUrl}
                  folder="health"
                  label="Cover image"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={category.is_active} className="h-4 w-4 rounded border-input" /> Active
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/health')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <GalleryManager entityType="health_category" entityId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
