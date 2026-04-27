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

  const featuredPosts = posts.filter((p) => p.is_featured);
  const regularPosts = posts.filter((p) => !p.is_featured);

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
          <p className="text-center text-muted-foreground">No blog posts yet. Check back soon!</p>
        ) : (
          <>
            {featuredPosts.map((post) => {
              const title = getLocalizedField(post, 'title', locale) || post.title_en;
              const excerpt = getLocalizedField(post, 'excerpt', locale) || '';
              const date = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { dateStyle: 'medium' }) : '';

              return (
                <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                  <Card className="mb-12 overflow-hidden lg:flex group">
                    <div className="aspect-video shrink-0 bg-gradient-to-br from-primary/10 to-secondary/10 lg:w-1/2">
                      {post.featured_image_url && (
                        <img src={post.featured_image_url} alt={title} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8 lg:w-1/2">
                      <Badge variant="secondary" className="w-fit mb-3">Featured</Badge>
                      <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">{title}</h2>
                      <p className="mt-3 text-muted-foreground">{excerpt}</p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.reading_time_minutes} min read</span>
                        <span>{date}</span>
                      </div>
                      <Button className="mt-6 w-fit">{t('common.readMore')}</Button>
                    </div>
                  </Card>
                </Link>
              );
            })}

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post) => {
                const title = getLocalizedField(post, 'title', locale) || post.title_en;
                const excerpt = getLocalizedField(post, 'excerpt', locale) || '';
                const date = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { dateStyle: 'medium' }) : '';

                return (
                  <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="aspect-video bg-gradient-to-br from-primary/5 to-muted">
                        {post.featured_image_url && (
                          <img src={post.featured_image_url} alt={title} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <CardHeader>
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
          </>
        )}
      </section>
    </>
  );
}
