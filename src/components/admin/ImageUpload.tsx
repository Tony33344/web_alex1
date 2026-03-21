'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, folder = 'pages', label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleRemove() {
    onChange('');
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="h-40 w-full rounded-lg object-cover border"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <label>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/90">
                <Upload className="h-3 w-3" /> Replace
              </span>
            </label>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading ? 'Uploading...' : 'Click or drag to upload'}
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 5MB</p>
          </div>
        </div>
      )}

      {/* Manual URL fallback */}
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste image URL..."
        className="text-xs"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
