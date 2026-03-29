import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { GalleryGrid } from '@/components/shared/GalleryGrid';
import { getHealthCategory } from '@/lib/queries/health';
import { getGalleryImages } from '@/lib/queries/gallery';
import { getLocalizedField } from '@/lib/localization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getHealthCategory(slug);
  if (!category) return { title: 'Category Not Found' };
  const name = getLocalizedField(category, 'name', locale) || category.name_en;
  const description = getLocalizedField(category, 'description', locale) || '';
  return {
    title: `${name} | Health`,
    description: description.slice(0, 160),
    openGraph: { title: name, description: description.slice(0, 160), images: category.cover_image_url ? [category.cover_image_url] : [] },
  };
}

export default async function HealthCategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const category = await getHealthCategory(slug);

  if (!category) notFound();

  const name = getLocalizedField(category, 'name', locale) || category.name_en;
  const description = getLocalizedField(category, 'description', locale) || '';
  const longContent = getLocalizedField(category, 'long_content', locale) || '';
  const galleryImages = await getGalleryImages('health_category', category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.health'), href: `/${locale}/health` }, { label: name }]} />

      {/* Full-width Main Image */}
      <div className="mt-8 aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
        {category.cover_image_url && (
          <img src={category.cover_image_url} alt={name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
          {(description || longContent) ? (
            <div className="space-y-8">
              {description && (
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: description }} />
              )}
              {longContent && (
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: longContent }} />
              )}
            </div>
          ) : (
            <div className="prose max-w-none text-muted-foreground">
              <p>Detailed content coming soon.</p>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width - Sticky with Gallery */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Gallery in sidebar */}
          {galleryImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gallery</h3>
              <GalleryGrid images={galleryImages} locale={locale} />
            </div>
          )}

          <Link href={`/${locale}/health`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('common.backTo')} {t('navigation.health')}
          </Link>
        </div>
      </div>
    </div>
  );
}
