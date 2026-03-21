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

export default function NewTeacherPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const slug = (fd.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'teachers', data: {
        slug, name: fd.get('name'), title_en: fd.get('title_en') || null,
        short_bio_en: fd.get('short_bio_en') || null, bio_en: fd.get('bio_en') || null,
        specialties: (fd.get('specialties') as string).split(',').map((s: string) => s.trim()).filter(Boolean),
        photo_url: fd.get('photo_url') || null,
        is_active: fd.get('is_active') === 'on',
      }}),
    });
    if (res.ok) router.push('/admin/teachers');
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Teacher</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English)</Label>
              <Input id="title_en" name="title_en" placeholder="e.g. Founder & Lead Teacher" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_bio_en">Short Bio (English)</Label>
              <Textarea id="short_bio_en" name="short_bio_en" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio_en">Full Bio (English)</Label>
              <Textarea id="bio_en" name="bio_en" rows={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma-separated)</Label>
              <Input id="specialties" name="specialties" placeholder="Sunyoga, Meditation, Healing" />
            </div>
            <div className="space-y-2">
              <Label>Teacher Photo</Label>
              <input type="hidden" name="photo_url" value={photoUrl} />
              <ImageUpload
                value={photoUrl || null}
                onChange={setPhotoUrl}
                folder="teachers"
                label="Teacher photo"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 rounded border-input" /> Active
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Teacher</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/teachers')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
