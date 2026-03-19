'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { TranslationOverride } from '@/types/database';
import { LOCALES } from '@/lib/constants';

export default function AdminTranslationsPage() {
  const [items, setItems] = useState<TranslationOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newLocale, setNewLocale] = useState('en');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('translation_overrides').select('*').order('translation_key');
      setItems((data as TranslationOverride[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function addOverride() {
    if (!newKey || !newValue) return;
    const supabase = createClient();
    const { data, error } = await supabase.from('translation_overrides').upsert({
      translation_key: newKey,
      locale: newLocale,
      value: newValue,
    }, { onConflict: 'translation_key,locale' }).select().single();

    if (data && !error) {
      setItems([...items.filter(i => !(i.translation_key === newKey && i.locale === newLocale)), data as TranslationOverride]);
      setNewKey(''); setNewValue('');
    }
  }

  async function deleteOverride(id: string) {
    const supabase = createClient();
    await supabase.from('translation_overrides').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Translation Overrides</h1>
        <p className="text-muted-foreground">Override default translations for any locale</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Add Override</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Input placeholder="Translation key (e.g. home.heroTitle)" value={newKey} onChange={e => setNewKey(e.target.value)} className="flex-1 min-w-[200px]" />
            <select value={newLocale} onChange={e => setNewLocale(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {LOCALES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <Input placeholder="Translation value" value={newValue} onChange={e => setNewValue(e.target.value)} className="flex-1 min-w-[200px]" />
            <Button onClick={addOverride} className="gap-2"><Plus className="h-4 w-4" />Add</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? <p className="text-muted-foreground">Loading...</p> : items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No translation overrides yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{item.translation_key}</code>
                    <span className="text-xs font-medium uppercase text-primary">{item.locale}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteOverride(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
