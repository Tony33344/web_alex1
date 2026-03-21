'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit, Plus, Eye, EyeOff, Target, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Page } from '@/types/database';

const ABOUT_SLUGS = ['mission', 'vision'];

const SLUG_META: Record<string, { icon: typeof Target; label: string; description: string }> = {
  mission: { icon: Target, label: 'Our Mission', description: 'Why we exist and what drives us' },
  vision: { icon: Compass, label: 'Our Vision', description: 'Where we are heading and the future we see' },
};

export default function AdminAboutPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      ABOUT_SLUGS.map((slug) =>
        fetch(`/api/admin/data?table=pages&eq=slug&eqVal=${slug}`)
          .then((r) => r.json())
          .then((d) => (Array.isArray(d) && d.length > 0 ? d[0] : null))
      )
    ).then((results) => {
      setPages(results.filter(Boolean) as Page[]);
      setLoading(false);
    });
  }, []);

  async function createPage(slug: string) {
    const meta = SLUG_META[slug];
    const res = await fetch('/api/admin/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'pages',
        data: {
          slug,
          title_en: meta.label,
          content_en: `<p>Add your ${slug} content here.</p>`,
          is_published: true,
          page_order: slug === 'mission' ? 1 : 2,
        },
      }),
    });
    if (res.ok) {
      const newPage = await res.json();
      setPages((prev) => [...prev, newPage]);
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch('/api/admin/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'pages', id, data: { is_published: !current } }),
    });
    setPages(pages.map((p) => (p.id === id ? { ...p, is_published: !current } : p)));
  }

  const getPage = (slug: string) => pages.find((p) => p.slug === slug);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">About</h1>
        <p className="text-muted-foreground">Manage your Mission and Vision pages</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ABOUT_SLUGS.map((slug) => {
          const page = getPage(slug);
          const meta = SLUG_META[slug];
          const Icon = meta.icon;

          return (
            <Card key={slug}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{meta.label}</CardTitle>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                  </div>
                  {page && (
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {page ? (
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/about/${page.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2">
                        <Edit className="h-4 w-4" /> Edit Content
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(page.id, page.is_published)}
                      title={page.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {page.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full gap-2" onClick={() => createPage(slug)}>
                    <Plus className="h-4 w-4" /> Create {meta.label} Page
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
