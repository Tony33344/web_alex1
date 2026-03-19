'use client';

import { useEffect, useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { NewsletterSubscriber } from '@/types/database';

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
      setSubs((data as NewsletterSubscriber[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function deleteSub(id: string) {
    if (!confirm('Remove this subscriber?')) return;
    const supabase = createClient();
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubs(subs.filter(s => s.id !== id));
  }

  function exportCSV() {
    const csv = ['email,name,language,active,subscribed_at', ...subs.map(s => `${s.email},${s.name || ''},${s.preferred_language},${s.is_active},${s.subscribed_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'newsletter_subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">{subs.filter(s => s.is_active).length} active subscribers</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={exportCSV}><Download className="h-4 w-4" />Export CSV</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : subs.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No subscribers yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {subs.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{sub.email}</span>
                  <Badge variant={sub.is_active ? 'default' : 'secondary'}>{sub.is_active ? 'Active' : 'Unsubscribed'}</Badge>
                  <span className="text-xs text-muted-foreground uppercase">{sub.preferred_language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{new Date(sub.subscribed_at).toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" onClick={() => deleteSub(sub.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
