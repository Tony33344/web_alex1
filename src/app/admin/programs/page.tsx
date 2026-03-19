'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Program } from '@/types/database';

export default function AdminProgramsPage() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/data?table=programs&orderBy=display_order&orderDir=asc')
      .then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function toggleActive(id: string, current: boolean) {
    await fetch('/api/admin/data', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'programs', id, data: { is_active: !current } }) });
    setItems(items.map(i => i.id === id ? { ...i, is_active: !current } : i));
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this program?')) return;
    await fetch('/api/admin/data', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'programs', id }) });
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Programs</h1><p className="text-muted-foreground">Manage coach training programs</p></div>
        <Link href="/admin/programs/new"><Button className="gap-2"><Plus className="h-4 w-4" />New Program</Button></Link>
      </div>
      {loading ? <p className="text-muted-foreground">Loading...</p> : items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No programs yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{item.name_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                    {item.is_featured && <Badge variant="outline">Featured</Badge>}
                    <span>{item.duration}</span>
                    <span>CHF {item.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id, item.is_active)}>{item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Link href={`/admin/programs/${item.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
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
