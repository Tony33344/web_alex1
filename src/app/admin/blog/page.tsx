'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { BlogPost } from '@/types/database';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      setPosts((data as BlogPost[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function togglePublish(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from('blog_posts').update({ is_published: !current }).eq('id', id);
    setPosts(posts.map(p => p.id === id ? { ...p, is_published: !current } : p));
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    const supabase = createClient();
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(posts.filter(p => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2"><Plus className="h-4 w-4" />New Post</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No blog posts yet. Create your first post.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-1">
                  <h3 className="font-medium">{post.title_en}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={post.is_published ? 'default' : 'secondary'}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    {post.is_members_only && <Badge variant="outline">Members Only</Badge>}
                    {post.category && <Badge variant="outline">{post.category}</Badge>}
                    <span>{post.views_count} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => togglePublish(post.id, post.is_published)}>
                    {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Link href={`/admin/blog/${post.id}`}>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => deletePost(post.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
