import { createClient } from '@/lib/supabase/server';
import type { GalleryImage } from '@/types/database';

export async function getGalleryImages(
  entityType: GalleryImage['entity_type'],
  entityId: string
): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getGalleryImages error:', error.message);
    return [];
  }
  return (data as GalleryImage[]) ?? [];
}
