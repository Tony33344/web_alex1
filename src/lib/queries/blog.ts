import { createClient } from '@/lib/supabase/server';
import type { BlogPost } from '@/types/database';

interface GetBlogPostsOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}

export async function getBlogPosts(options: GetBlogPostsOptions = {}): Promise<{ posts: BlogPost[]; totalCount: number }> {
  const { page = 1, limit = 12, category, search, featured } = options;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('is_published', true);

  if (category) {
    query = query.eq('category', category);
  }
  if (search) {
    query = query.or(`title_en.ilike.%${search}%,content_en.ilike.%${search}%`);
  }
  if (featured) {
    query = query.eq('is_featured', true);
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('getBlogPosts error:', error.message);
    return { posts: [], totalCount: 0 };
  }
  return { posts: (data as BlogPost[]) ?? [], totalCount: count ?? 0 };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    console.error('getBlogPost error:', error.message);
    return null;
  }
  return data as BlogPost;
}

export async function getPopularPosts(limit = 5): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('views_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getPopularPosts error:', error.message);
    return [];
  }
  return (data as BlogPost[]) ?? [];
}
