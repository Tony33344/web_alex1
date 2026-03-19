import { createClient } from '@/lib/supabase/server';
import type { Teacher } from '@/types/database';

export async function getTeachers(): Promise<Teacher[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('getTeachers error:', error.message);
    return [];
  }
  return (data as Teacher[]) ?? [];
}

export async function getTeacher(slug: string): Promise<Teacher | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('getTeacher error:', error.message);
    return null;
  }
  return data as Teacher;
}
