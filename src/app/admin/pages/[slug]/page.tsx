'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import type { Page } from '@/types/database';

const LOCALES = ['en', 'de', 'it', 'fr', 'hi', 'si'] as const;

export default function AdminPageEditPage() {
  const params = useParams();
  const id = params.slug as string;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeLocale, setActiveLocale] = useState<string>('en');

  useEffect(() => {
    fetch(`/api/admin/data?table=pages&id=${id}`)
      .then((r) => r.json())
      .then((d) => {
        setPage(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    setError('');
    setSuccess('');

    const res = await fetch('/api/admin/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'pages',
        id: page.id,
        data: {
          title_en: page.title_en,
          title_de: page.title_de,
          title_it: page.title_it,
          title_fr: page.title_fr,
          title_hi: page.title_hi,
          title_si: page.title_si,
          content_en: page.content_en,
          content_de: page.content_de,
          content_it: page.content_it,
          content_fr: page.content_fr,
          content_hi: page.content_hi,
          content_si: page.content_si,
          meta_description_en: page.meta_description_en,
          hero_image_url: page.hero_image_url,
          is_published: page.is_published,
          updated_at: new Date().toISOString(),
        },
      }),
    });

    if (res.ok) {
      setSuccess('Saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to save');
    }
    setSaving(false);
  }

  function updateField(field: string, value: string | boolean) {
    if (!page) return;
    setPage({ ...page, [field]: value } as Page);
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  if (!page) {
    return (
      <div className="space-y-6">
        <p className="text-destructive">Page not found</p>
        <Link href="/admin/pages">
          <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to Pages</Button>
        </Link>
      </div>
    );
  }

  const titleField = `title_${activeLocale}` as keyof Page;
  const contentField = `content_${activeLocale}` as keyof Page;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit: {page.title_en}</h1>
            <p className="text-sm text-muted-foreground">/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-sm text-destructive">{error}</span>}
          {success && <span className="text-sm text-primary">{success}</span>}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border p-1 w-fit">
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setActiveLocale(loc)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeLocale === loc ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {loc.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Content ({activeLocale.toUpperCase()})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={(page[titleField] as string) || ''}
                  onChange={(e) => updateField(titleField, e.target.value)}
                  placeholder={`Title in ${activeLocale.toUpperCase()}`}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  value={(page[contentField] as string) || ''}
                  onChange={(html) => updateField(contentField, html)}
                  placeholder={`Content in ${activeLocale.toUpperCase()}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <button
                  id="published"
                  type="button"
                  role="switch"
                  aria-checked={page.is_published}
                  onClick={() => updateField('is_published', !page.is_published)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    page.is_published ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      page.is_published ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={page.slug} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Hero Image</Label>
                <ImageUpload
                  value={page.hero_image_url}
                  onChange={(url) => updateField('hero_image_url', url)}
                  folder={`pages/${page.slug}`}
                  label="Hero image"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={page.meta_description_en || ''}
                  onChange={(e) => updateField('meta_description_en', e.target.value)}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
