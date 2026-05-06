'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function NewHealthCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [longContent, setLongContent] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const slug = (fd.get('name_en') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'health_categories', data: {
        slug,
        name_en: fd.get('name_en'),
        name_de: fd.get('name_de') || null,
        name_it: fd.get('name_it') || null,
        name_fr: fd.get('name_fr') || null,
        name_hi: fd.get('name_hi') || null,
        name_si: fd.get('name_si') || null,
        description_en: fd.get('description_en') || null,
        description_de: fd.get('description_de') || null,
        description_it: fd.get('description_it') || null,
        description_fr: fd.get('description_fr') || null,
        description_hi: fd.get('description_hi') || null,
        description_si: fd.get('description_si') || null,
        long_content_en: fd.get('long_content_en') || null,
        long_content_de: fd.get('long_content_de') || null,
        long_content_it: fd.get('long_content_it') || null,
        long_content_fr: fd.get('long_content_fr') || null,
        long_content_hi: fd.get('long_content_hi') || null,
        long_content_si: fd.get('long_content_si') || null,
        icon_name: fd.get('icon_name') || null,
        cover_image_url: fd.get('cover_image_url') || null,
        is_active: fd.get('is_active') === 'on',
      }}),
    });
    if (res.ok) router.push('/admin/health');
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Health Category</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English) *</Label>
                <Input id="name_en" name="name_en" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_de">Name (German)</Label>
                <Input id="name_de" name="name_de" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_it">Name (Italian)</Label>
                <Input id="name_it" name="name_it" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_fr">Name (French)</Label>
                <Input id="name_fr" name="name_fr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_hi">Name (Hindi)</Label>
                <Input id="name_hi" name="name_hi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_si">Name (Slovenian)</Label>
                <Input id="name_si" name="name_si" />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="description_de">Description (German)</Label>
                <Textarea id="description_de" name="description_de" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_it">Description (Italian)</Label>
                <Textarea id="description_it" name="description_it" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_fr">Description (French)</Label>
                <Textarea id="description_fr" name="description_fr" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_hi">Description (Hindi)</Label>
                <Textarea id="description_hi" name="description_hi" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_si">Description (Slovenian)</Label>
                <Textarea id="description_si" name="description_si" rows={4} />
              </div>
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
                <Label htmlFor="long_content_de">Long Content (German)</Label>
                <Textarea id="long_content_de" name="long_content_de" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_it">Long Content (Italian)</Label>
                <Textarea id="long_content_it" name="long_content_it" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_fr">Long Content (French)</Label>
                <Textarea id="long_content_fr" name="long_content_fr" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_hi">Long Content (Hindi)</Label>
                <Textarea id="long_content_hi" name="long_content_hi" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="long_content_si">Long Content (Slovenian)</Label>
                <Textarea id="long_content_si" name="long_content_si" rows={6} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icon Name</Label>
                <Input id="icon_name" name="icon_name" placeholder="e.g. Heart, Sun, Brain" />
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
              <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 rounded border-input" /> Active
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Category</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/health')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
