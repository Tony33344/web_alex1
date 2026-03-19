'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { HealthCategory } from '@/types/database';

export default function AdminHealthPage() {
  const [items, setItems] = useState<HealthCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('health_categories').select('*').order('display_order');
      setItems((data as HealthCategory[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from('health_categories').update({ is_active: !current }).eq('id', id);
    setItems(items.map(i => i.id === id ? { ...i, is_active: !current } : i));
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this health category?')) return;
    const supabase = createClient();
    await supabase.from('health_categories').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Health Categories</h1><p className="text-muted-foreground">Manage health pillars</p></div>
        <Link href="/admin/health/new"><Button className="gap-2"><Plus className="h-4 w-4" />New Category</Button></Link>
      </div>
      {loading ? <p className="text-muted-foreground">Loading...</p> : items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No health categories yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{item.name_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                    <span>/{item.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id, item.is_active)}>{item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Link href={`/admin/health/${item.id}`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
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
