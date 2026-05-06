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

export default function NewTeacherPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [bio, setBio] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const slug = (fd.get('name') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const res = await fetch('/api/admin/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'teachers', data: {
        slug,
        name: fd.get('name'),
        title_en: fd.get('title_en') || null,
        title_de: fd.get('title_de') || null,
        title_it: fd.get('title_it') || null,
        title_fr: fd.get('title_fr') || null,
        title_hi: fd.get('title_hi') || null,
        title_si: fd.get('title_si') || null,
        short_bio_en: fd.get('short_bio_en') || null,
        short_bio_de: fd.get('short_bio_de') || null,
        short_bio_it: fd.get('short_bio_it') || null,
        short_bio_fr: fd.get('short_bio_fr') || null,
        short_bio_hi: fd.get('short_bio_hi') || null,
        short_bio_si: fd.get('short_bio_si') || null,
        bio_en: fd.get('bio_en') || null,
        bio_de: fd.get('bio_de') || null,
        bio_it: fd.get('bio_it') || null,
        bio_fr: fd.get('bio_fr') || null,
        bio_hi: fd.get('bio_hi') || null,
        bio_si: fd.get('bio_si') || null,
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
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="title_en">Title (English)</Label>
                <Input id="title_en" name="title_en" placeholder="e.g. Founder & Lead Teacher" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_de">Title (German)</Label>
                <Input id="title_de" name="title_de" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_it">Title (Italian)</Label>
                <Input id="title_it" name="title_it" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_fr">Title (French)</Label>
                <Input id="title_fr" name="title_fr" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_hi">Title (Hindi)</Label>
                <Input id="title_hi" name="title_hi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title_si">Title (Slovenian)</Label>
                <Input id="title_si" name="title_si" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Short Bio (English)</Label>
              <input type="hidden" name="short_bio_en" value={shortBio} />
              <RichTextEditor
                value={shortBio || ''}
                onChange={setShortBio}
                placeholder="Brief teacher bio"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="short_bio_de">Short Bio (German)</Label>
                <Textarea id="short_bio_de" name="short_bio_de" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_bio_it">Short Bio (Italian)</Label>
                <Textarea id="short_bio_it" name="short_bio_it" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_bio_fr">Short Bio (French)</Label>
                <Textarea id="short_bio_fr" name="short_bio_fr" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_bio_hi">Short Bio (Hindi)</Label>
                <Textarea id="short_bio_hi" name="short_bio_hi" rows={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_bio_si">Short Bio (Slovenian)</Label>
                <Textarea id="short_bio_si" name="short_bio_si" rows={4} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Full Bio (English)</Label>
              <input type="hidden" name="bio_en" value={bio} />
              <RichTextEditor
                value={bio || ''}
                onChange={setBio}
                placeholder="Detailed teacher biography"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bio_de">Full Bio (German)</Label>
                <Textarea id="bio_de" name="bio_de" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio_it">Full Bio (Italian)</Label>
                <Textarea id="bio_it" name="bio_it" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio_fr">Full Bio (French)</Label>
                <Textarea id="bio_fr" name="bio_fr" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio_hi">Full Bio (Hindi)</Label>
                <Textarea id="bio_hi" name="bio_hi" rows={6} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio_si">Full Bio (Slovenian)</Label>
                <Textarea id="bio_si" name="bio_si" rows={6} />
              </div>
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
