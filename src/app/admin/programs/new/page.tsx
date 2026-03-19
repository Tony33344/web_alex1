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

export default function NewProgramPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const slug = (fd.get('name_en') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const supabase = createClient();
    const { error } = await supabase.from('programs').insert({
      slug,
      name_en: fd.get('name_en') as string,
      name_de: fd.get('name_de') as string || null,
      description_en: fd.get('description_en') as string || null,
      duration: fd.get('duration') as string || null,
      price: parseFloat(fd.get('price') as string) || null,
      max_participants: parseInt(fd.get('max_participants') as string) || null,
      what_you_learn: (fd.get('what_you_learn') as string).split('\n').map(s => s.trim()).filter(Boolean),
      prerequisites: (fd.get('prerequisites') as string).split('\n').map(s => s.trim()).filter(Boolean),
      is_active: fd.get('is_active') === 'on',
      is_featured: fd.get('is_featured') === 'on',
    });

    if (!error) router.push('/admin/programs');
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold">New Program</h1>
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
              <Textarea id="description_en" name="description_en" rows={4} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g. 6 months" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (CHF)</Label>
                <Input id="price" name="price" type="number" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input id="max_participants" name="max_participants" type="number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="what_you_learn">What You&apos;ll Learn (one per line)</Label>
              <Textarea id="what_you_learn" name="what_you_learn" rows={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prerequisites">Prerequisites (one per line)</Label>
              <Textarea id="prerequisites" name="prerequisites" rows={3} />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked className="h-4 w-4 rounded border-input" /> Active</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" className="h-4 w-4 rounded border-input" /> Featured</label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Create Program</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/admin/programs')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
