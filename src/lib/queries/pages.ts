import { createClient } from '@/lib/supabase/server';
import type { Page, Section } from '@/types/database';

export async function getPage(slug: string): Promise<Page | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('getPage error:', error.message);
    return null;
  }
  return data as Page;
}

export async function getPageSections(pageId: string): Promise<Section[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_visible', true)
    .order('section_order', { ascending: true });

  if (error) {
    console.error('getPageSections error:', error.message);
    return [];
  }
  return (data as Section[]) ?? [];
}

export async function getPageWithSections(slug: string): Promise<{ page: Page; sections: Section[] } | null> {
  const page = await getPage(slug);
  if (!page) return null;
  const sections = await getPageSections(page.id);
  return { page, sections };
}
