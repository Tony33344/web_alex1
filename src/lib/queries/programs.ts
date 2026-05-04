import { createClient } from '@/lib/supabase/server';
import type { Program } from '@/types/database';

export async function getPrograms(): Promise<Program[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('start_date', { ascending: true, nullsFirst: false })
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getPrograms error:', error.message);
    return [];
  }
  return (data as Program[]) ?? [];
}

export async function getProgram(slug: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('getProgram error:', error.message);
    return null;
  }
  return data as Program;
}

export async function getFeaturedPrograms(limit = 3): Promise<Program[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('getFeaturedPrograms error:', error.message);
    return [];
  }
  return (data as Program[]) ?? [];
}
