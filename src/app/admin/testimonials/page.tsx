'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Testimonial } from '@/types/database';

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=testimonials&orderBy=display_order&orderDir=asc')
      .then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublish(id: string, current: boolean) {
    await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'testimonials', id, data: { is_published: !current } }) });
    setItems(items.map(i => i.id === id ? { ...i, is_published: !current } : i));
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch('/api/admin/data', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'testimonials', id }) });
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Testimonials</h1><p className="text-muted-foreground">Manage student testimonials</p></div>
        <Link href="/admin/testimonials/new"><Button className="gap-2"><Plus className="h-4 w-4" />New Testimonial</Button></Link>
      </div>
      {loading ? <p className="text-muted-foreground">Loading...</p> : items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No testimonials yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.author_name}</h3>
                    <Badge variant={item.is_published ? 'default' : 'secondary'}>{item.is_published ? 'Published' : 'Draft'}</Badge>
                    {item.is_featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.content_en}</p>
                  <div className="flex gap-0.5">{[...Array(item.rating || 0)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current text-secondary" />)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(item.id, item.is_published)}>{item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Link href={`/admin/testimonials/${item.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                  <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
