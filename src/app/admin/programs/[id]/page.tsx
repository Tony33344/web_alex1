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
import type { Program } from '@/types/database';

export default function EditProgramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch(`/api/admin/data?table=programs&id=${id}`)
      .then(r => r.json()).then(d => { setProgram(d as Program | null); setImageUrl((d as Program)?.image_url || ''); setDescription((d as Program)?.description_en || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch('/api/admin/data', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'programs', id, data: {
        name_en: fd.get('name_en'), name_de: fd.get('name_de') || null,
        description_en: fd.get('description_en') || null,
        duration: fd.get('duration') || null,
        price: parseFloat(fd.get('price') as string) || null,
        stripe_price_id: fd.get('stripe_price_id') || null,
        max_participants: parseInt(fd.get('max_participants') as string) || null,
        image_url: fd.get('image_url') || null,
        what_you_learn: (fd.get('what_you_learn') as string).split('\n').map((s: string) => s.trim()).filter(Boolean),
        prerequisites: (fd.get('prerequisites') as string).split('\n').map((s: string) => s.trim()).filter(Boolean),
        is_active: fd.get('is_active') === 'on',
        is_featured: fd.get('is_featured') === 'on',
      }}),
    });
    if (res.ok) router.push('/admin/programs');
    setSaving(false);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!program) return <p className="text-destructive">Program not found.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">Edit Program</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name_en">Name (English) *</Label>
                <Input id="name_en" name="name_en" required defaultValue={program.name_en} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_de">Name (German)</Label>
                <Input id="name_de" name="name_de" defaultValue={program.name_de || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <input type="hidden" name="description_en" value={description} />
              <RichTextEditor
                value={description || ''}
                onChange={setDescription}
                placeholder="Program description"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" defaultValue={program.duration || ''} placeholder="e.g. 6 months" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input id="max_participants" name="max_participants" type="number" defaultValue={program.max_participants || ''} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Price (CHF)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={program.price || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
                <Input id="stripe_price_id" name="stripe_price_id" placeholder="price_..." defaultValue={program.stripe_price_id || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Program Image</Label>
              <input type="hidden" name="image_url" value={imageUrl} />
              <ImageUpload
                value={imageUrl || null}
                onChange={setImageUrl}
                folder="programs"
                label="Program image"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="what_you_learn">What You&apos;ll Learn (one per line)</Label>
              <Textarea id="what_you_learn" name="what_you_learn" rows={5} defaultValue={program.what_you_learn?.join('\n') || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites (one per line)</Label>
              <Textarea id="prerequisites" name="prerequisites" rows={3} defaultValue={program.prerequisites?.join('\n') || ''} />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked={program.is_active} className="h-4 w-4 rounded border-input" /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={program.is_featured} className="h-4 w-4 rounded border-input" /> Featured</label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/programs')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <GalleryManager entityType="program" entityId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
