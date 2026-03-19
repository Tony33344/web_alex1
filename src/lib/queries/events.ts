import { createClient } from '@/lib/supabase/server';
import type { Event } from '@/types/database';

interface GetEventsOptions {
  page?: number;
  limit?: number;
  upcoming?: boolean;
  featured?: boolean;
}

export async function getEvents(options: GetEventsOptions = {}): Promise<{ events: Event[]; totalCount: number }> {
  const { page = 1, limit = 12, upcoming = true, featured } = options;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (upcoming) {
    query = query.gte('start_date', new Date().toISOString());
  }
  if (featured) {
    query = query.eq('is_featured', true);
  }

  const { data, error, count } = await query
    .order('start_date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getEvents error:', error.message);
    return { events: [], totalCount: 0 };
  }
  return { events: (data as Event[]) ?? [], totalCount: count ?? 0 };
}

export async function getEvent(slug: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('getEvent error:', error.message);
    return null;
  }
  return data as Event;
}

export async function getFeaturedEvent(): Promise<Event | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('start_date', new Date().toISOString())
    .order('start_date', { ascending: true })
    .limit(1)
    .single();

  if (error) return null;
  return data as Event;
}
