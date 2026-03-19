import { createClient } from '@/lib/supabase/server';
import type { HealthCategory } from '@/types/database';

export async function getHealthCategories(): Promise<HealthCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getHealthCategories error:', error.message);
    return [];
  }
  return (data as HealthCategory[]) ?? [];
}

export async function getHealthCategory(slug: string): Promise<HealthCategory | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('getHealthCategory error:', error.message);
    return null;
  }
  return data as HealthCategory;
}
