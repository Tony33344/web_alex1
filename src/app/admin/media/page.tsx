'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Media } from '@/types/database';

export default function AdminMediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      setItems((data as Media[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (uploadError) { alert('Upload failed'); return; }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);

    const { data: record } = await supabase.from('media').insert({
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      folder: 'general',
    }).select().single();

    if (record) setItems([record as Media, ...items]);
  }

  async function deleteMedia(id: string, fileName: string) {
    if (!confirm('Delete this file?')) return;
    const supabase = createClient();
    await supabase.from('media').delete().eq('id', id);
    setItems(items.filter(i => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Media Library</h1><p className="text-muted-foreground">{items.length} files</p></div>
        <label>
          <input type="file" className="hidden" accept="image/*,video/*,.pdf" onChange={handleUpload} />
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Upload className="h-4 w-4" />Upload File</span>
        </label>
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : items.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No media files yet. Upload your first file.</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="relative aspect-square bg-muted flex items-center justify-center">
                {item.file_type.startsWith('image/') ? (
                  <img src={item.file_url} alt={item.alt_text || item.file_name} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMedia(item.id, item.file_name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-3">
                <p className="text-xs font-medium truncate">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">{item.file_type} · {Math.round((item.file_size || 0) / 1024)} KB</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
