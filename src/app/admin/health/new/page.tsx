'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function NewHealthCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const slug = (fd.get('name_en') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const supabase = createClient();
    const { error } = await supabase.from('health_categories').insert({
      slug,
      name_en: fd.get('name_en') as string,
      name_de: fd.get('name_de') as string || null,
      description_en: fd.get('description_en') as string || null,
      long_content_en: fd.get('long_content_en') as string || null,
      icon_name: fd.get('icon_name') as string || null,
      cover_image_url: fd.get('cover_image_url') as string || null,
      is_active: fd.get('is_active') === 'on',
    });

    if (!error) router.push('/admin/health');
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Health Category</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English) *</Label>
                <Input id="name_en" name="name_en" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_de">Name (German)</Label>
                <Input id="name_de" name="name_de" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea id="description_en" name="description_en" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long_content_en">Long Content (English / HTML)</Label>
              <Textarea id="long_content_en" name="long_content_en" rows={10} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icon Name</Label>
                <Input id="icon_name" name="icon_name" placeholder="e.g. Heart, Sun, Brain" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input id="cover_image_url" name="cover_image_url" />
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
