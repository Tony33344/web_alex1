import Link from 'next/link';
import { ArrowLeft, Clock, Calendar as CalendarIcon, User, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs locale={locale} items={[{ label: 'Blog', href: `/${locale}/blog` }, { label: title }]} />

      <header className="mt-8 space-y-4">
        <Badge variant="outline" className="text-xs">Wellness</Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><User className="h-4 w-4" />Avalon</span>
          <span className="flex items-center gap-1.5"><CalendarIcon className="h-4 w-4" />Jan 15, 2026</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />5 min read</span>
        </div>
      </header>

      <div className="mt-8 aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10" />

      <div className="prose prose-lg mt-8 max-w-none text-muted-foreground">
        <p>Blog post content will be loaded from Supabase when the database is connected. This page renders the full blog post with rich text content, images, and related posts.</p>
        <p>The content supports multiple languages and will automatically display in the user&apos;s selected locale. Members-only posts will show a paywall for non-subscribers.</p>
      </div>

      <footer className="mt-12 flex items-center justify-between border-t pt-6">
        <Link href={`/${locale}/blog`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </footer>
    </article>
  );
}
