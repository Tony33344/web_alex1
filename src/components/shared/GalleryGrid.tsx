'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLocalizedField } from '@/lib/localization';
import type { GalleryImage } from '@/types/database';

interface GalleryGridProps {
  images: GalleryImage[];
  locale?: string;
}

export function GalleryGrid({ images, locale = 'en' }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images.length) return null;

  const count = images.length;

  function openLightbox(i: number) { setLightboxIndex(i); }
  function closeLightbox() { setLightboxIndex(null); }
  function prev() { setLightboxIndex((i) => (i !== null ? (i - 1 + count) % count : null)); }
  function next() { setLightboxIndex((i) => (i !== null ? (i + 1) % count : null)); }

  function getCaption(img: GalleryImage) {
    return getLocalizedField(img, 'caption', locale) || '';
  }

  function getAltText(img: GalleryImage) {
    return getLocalizedField(img, 'alt_text', locale) || getLocalizedField(img, 'caption', locale) || '';
  }

  // Adaptive layout classes based on image count
  function getLayoutClasses(): string {
    if (count === 1) return 'grid grid-cols-1';
    if (count === 2) return 'grid grid-cols-2 gap-3';
    if (count === 3) return 'grid grid-cols-2 gap-3';
    if (count === 4) return 'grid grid-cols-2 gap-3';
    return 'grid grid-cols-2 md:grid-cols-3 gap-3';
  }

  // Per-image aspect ratio for visual interest
  function getImageClasses(index: number): string {
    if (count === 1) return 'aspect-[16/9] rounded-2xl';
    if (count === 2) return 'aspect-[4/3] rounded-xl';
    if (count === 3 && index === 0) return 'aspect-[4/3] rounded-xl col-span-2';
    if (count === 3) return 'aspect-[4/3] rounded-xl';
    if (count === 4) return 'aspect-[4/3] rounded-xl';
    // 5+ images
    if (index === 0) return 'aspect-[4/3] rounded-xl col-span-2 md:col-span-2';
    return 'aspect-[4/3] rounded-xl';
  }

  return (
    <>
      <div className={getLayoutClasses()}>
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => openLightbox(i)}
            className={`group relative overflow-hidden bg-muted ${getImageClasses(i)} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            <img
              src={img.image_url}
              alt={getAltText(img)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {getCaption(img) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white line-clamp-1">{getCaption(img)}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Nav arrows */}
          {count > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].image_url}
              alt={getAltText(images[lightboxIndex])}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
            {getCaption(images[lightboxIndex]) && (
              <p className="mt-3 text-center text-sm text-white/80">
                {getCaption(images[lightboxIndex])}
              </p>
            )}
            {count > 1 && (
              <p className="mt-1 text-center text-xs text-white/50">
                {lightboxIndex + 1} / {count}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
