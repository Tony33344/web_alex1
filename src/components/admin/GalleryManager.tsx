'use client';

import { useState, useEffect, useRef } from 'react';
import { GripVertical, X, Loader2, Plus, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import type { GalleryImage } from '@/types/database';

interface GalleryManagerProps {
  entityType: GalleryImage['entity_type'];
  entityId: string;
}

export function GalleryManager({ entityType, entityId }: GalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [entityType, entityId]);

  async function fetchImages() {
    setLoading(true);
    const res = await fetch(
      `/api/admin/data?table=gallery_images&eq=entity_type&eqVal=${entityType}&orderBy=display_order&orderDir=asc`
    );
    const all = (await res.json()) as GalleryImage[];
    // Filter client-side for entity_id since the API only supports one eq filter
    setImages(all.filter((img) => img.entity_id === entityId));
    setLoading(false);
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Only image files'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5MB'); return; }

    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `gallery/${entityType}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) { setError(uploadError.message); setUploading(false); return; }

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);

      // Insert into gallery_images
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'gallery_images',
          data: {
            entity_type: entityType,
            entity_id: entityId,
            image_url: publicUrl,
            display_order: images.length,
            is_visible: true,
          },
        }),
      });

      if (res.ok) {
        await fetchImages();
      } else {
        setError('Failed to save image record');
      }
    } catch {
      setError('Upload failed');
    }
    setUploading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    // Upload all selected files sequentially
    Array.from(files).reduce(
      (chain, file) => chain.then(() => uploadFile(file)),
      Promise.resolve()
    );
    if (inputRef.current) inputRef.current.value = '';
  }

  async function removeImage(id: string) {
    await fetch('/api/admin/data', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'gallery_images', id }),
    });
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  async function updateCaption(id: string, caption: string) {
    await fetch('/api/admin/data', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'gallery_images', id, data: { caption_en: caption } }),
    });
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, caption_en: caption } : img)));
  }

  // Drag-and-drop reorder
  function handleDragStart(idx: number) { setDragIdx(idx); }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;

    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(dragIdx, 1);
      copy.splice(idx, 0, moved);
      return copy;
    });
    setDragIdx(idx);
  }

  async function handleDragEnd() {
    setDragIdx(null);
    // Persist new order
    await Promise.all(
      images.map((img, i) =>
        fetch('/api/admin/data', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ table: 'gallery_images', id: img.id, data: { display_order: i } }),
        })
      )
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading gallery...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Gallery Images</Label>
        <span className="text-xs text-muted-foreground">{images.length} image{images.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`group relative rounded-lg overflow-hidden border transition-all ${
                dragIdx === i ? 'ring-2 ring-primary opacity-70' : 'hover:ring-1 hover:ring-primary/30'
              }`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text_en || ''}
                className="aspect-square w-full object-cover"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 cursor-grab items-center justify-center rounded bg-white/20 text-white">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="flex h-7 w-7 items-center justify-center rounded bg-destructive/80 text-white hover:bg-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Order badge */}
              <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-medium text-white">
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Caption editing */}
      {images.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            Edit captions
          </summary>
          <div className="mt-2 space-y-2">
            {images.map((img, i) => (
              <div key={img.id} className="flex items-center gap-2">
                <span className="w-6 text-xs text-muted-foreground text-right">{i + 1}.</span>
                <Input
                  defaultValue={img.caption_en || ''}
                  placeholder="Caption (English)"
                  className="text-xs h-8"
                  onBlur={(e) => updateCaption(img.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Upload button */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-1.5"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 cursor-pointer hover:border-primary/50 transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Click to add gallery images</p>
          <p className="text-xs text-muted-foreground/60">Drag to reorder after upload</p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
