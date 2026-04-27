'use client';

import { useState, useRef, useCallback } from 'react';

type ImageOrientation = 'landscape' | 'portrait' | 'square';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** For card/listing contexts — forces a fixed aspect ratio regardless of image orientation */
  fixedRatio?: boolean;
  /** Fallback aspect class when image hasn't loaded yet (default: aspect-video) */
  fallbackAspect?: string;
}

export function SmartImage({ src, alt, className = '', fixedRatio = false, fallbackAspect = 'aspect-video' }: SmartImageProps) {
  const [orientation, setOrientation] = useState<ImageOrientation | null>(null);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    if (fixedRatio) return;
    const img = imgRef.current;
    if (!img) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    if (ratio > 1.2) setOrientation('landscape');
    else if (ratio < 0.8) setOrientation('portrait');
    else setOrientation('square');
    setLoaded(true);
  }, [fixedRatio]);

  // Container classes based on detected orientation
  function getContainerClasses(): string {
    if (!loaded || !orientation) {
      return fallbackAspect;
    }
    switch (orientation) {
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4] max-w-2xl mx-auto';
      case 'square':
        return 'aspect-square max-w-3xl mx-auto';
    }
  }

  return (
    <div className={`overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ${getContainerClasses()} ${className} transition-[max-width] duration-300`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
