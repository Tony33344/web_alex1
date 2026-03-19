import { createClient } from '@/lib/supabase/server';
import type { Testimonial } from '@/types/database';

export async function getTestimonials(options: { featured?: boolean; teacherId?: string } = {}): Promise<Testimonial[]> {
  const { featured, teacherId } = options;
  const supabase = await createClient();
  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true);

  if (featured) {
    query = query.eq('is_featured', true);
  }
  if (teacherId) {
    query = query.eq('teacher_id', teacherId);
  }

  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) {
    console.error('getTestimonials error:', error.message);
    return [];
  }
  return (data as Testimonial[]) ?? [];
}
