import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage('vision');
  const title = page ? (getLocalizedField(page, 'title', locale) || page.title_en) : 'Our Vision';
  return { title: `${title} | About` };
}

export default async function VisionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const page = await getPage('vision');

  const title = page ? (getLocalizedField(page, 'title', locale) || page.title_en) : 'Our Vision';
  const content = page ? (getLocalizedField(page, 'content', locale) || page.content_en) : null;

  return (
    <div className="min-h-screen bg-background">
      {page?.hero_image_url && (
        <div
          className="relative h-64 bg-cover bg-center sm:h-80"
          style={{ backgroundImage: `url(${page.hero_image_url})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative mx-auto flex h-full max-w-4xl items-end px-4 pb-8">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {!page?.hero_image_url && (
          <h1 className="mb-8 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        )}

        {content ? (
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Vision content will appear here once published in the admin panel.</p>
          </div>
        )}

        <div className="mt-12">
          <Link
            href={`/${locale}/about/mission`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← Read Our Mission
          </Link>
        </div>

        <div className="mt-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {t('navigation.home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
