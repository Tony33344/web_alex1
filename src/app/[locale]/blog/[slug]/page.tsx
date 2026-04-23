import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Clock, Calendar as CalendarIcon, User, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getBlogPost } from '@/lib/queries/blog';
import { getLocalizedField } from '@/lib/localization';
import { processContent } from '@/lib/utils/text';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post Not Found' };
  const title = getLocalizedField(post, 'title', locale) || post.title_en;
  const excerpt = getLocalizedField(post, 'excerpt', locale) || '';
  return {
    title,
    description: excerpt.slice(0, 160),
    openGraph: { title, description: excerpt.slice(0, 160), images: post.featured_image_url ? [post.featured_image_url] : [] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const title = getLocalizedField(post, 'title', locale) || post.title_en;
  const content = getLocalizedField(post, 'content', locale) || '';
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { dateStyle: 'long' }) : '';

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.blog'), href: `/${locale}/blog` }, { label: title }]} />

      <header className="mt-8 space-y-4">
        {post.category && <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />Author</span>
          {date && <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" />{date}</span>}
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{post.reading_time_minutes} min read</span>
        </div>
      </header>

      <div className="mt-8 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
        {post.featured_image_url && (
          <img src={post.featured_image_url} alt={title} className="h-full w-full object-cover" />
        )}
      </div>

      {content ? (
        <div className="prose prose-lg mt-8 max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: processContent(content) }} />
      ) : (
        <div className="prose prose-lg mt-8 max-w-none text-muted-foreground">
          <p>Content coming soon.</p>
        </div>
      )}

      <footer className="mt-12 flex items-center justify-between border-t pt-6">
        <Link href={`/${locale}/blog`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('common.backTo')} {t('navigation.blog')}
        </Link>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" /> {t('common.share')}
        </Button>
      </footer>
    </article>
  );
}
