import { getTranslations } from 'next-intl/server';
import { BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { getBlogPosts } from '@/lib/queries/blog';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const [{ posts }, blogPage] = await Promise.all([
    getBlogPosts({ limit: 20 }),
    getPage('blog'),
  ]);

  const pageTitle = blogPage ? (getLocalizedField(blogPage, 'title', locale) || t('navigation.blog')) : t('navigation.blog');
  const pageContent = blogPage ? (getLocalizedField(blogPage, 'content', locale) || '') : '';

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageContent}
        backgroundColor={blogPage?.background_color}
        gradientTo={blogPage?.banner_gradient_to}
        textColor={blogPage?.text_color}
        width={blogPage?.banner_width}
        height={blogPage?.banner_height}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">{t('blog.noPostsYet')}</p>
        ) : (
          <div className="grid grid-cols-2 gap-8 items-stretch auto-rows-fr">
            {posts.map((post) => {
              const title = getLocalizedField(post, 'title', locale) || post.title_en;
              const excerpt = getLocalizedField(post, 'excerpt', locale) || '';
              const date = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { dateStyle: 'medium' }) : '';

              return (
                <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                  <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg min-h-[400px]">
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-muted">
                      {post.featured_image_url && (
                        <img src={post.featured_image_url} alt={title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <CardHeader className="flex-shrink-0">
                      {post.category && <Badge variant="outline" className="w-fit text-xs capitalize">{post.category}</Badge>}
                      <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                        {title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{excerpt}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{post.reading_time_minutes} min read</span>
                        <span>{date}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
