'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Page } from '@/types/database';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=pages&orderBy=page_order&orderDir=asc')
      .then(r => r.json()).then(d => { setPages(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublish(id: string, current: boolean) {
    await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'pages', id, data: { is_published: !current } }) });
    setPages(pages.map(p => p.id === id ? { ...p, is_published: !current } : p));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage your site pages and content sections</p>
        </div>
        <Link href="/admin/pages/new">
          <Button className="gap-2"><Plus className="h-4 w-4" />New Page</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{page.title_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>{page.is_published ? 'Published' : 'Draft'}</Badge>
                    <span>/{page.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(page.id, page.is_published)}>
                    {page.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/admin/pages/${page.id}`}>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
