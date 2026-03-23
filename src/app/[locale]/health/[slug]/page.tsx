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
import { nl2br } from '@/lib/utils/text';

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
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.health'), href: `/${locale}/health` }, { label: name }]} />

      <div className="mt-8 space-y-8">
        <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
          {category.cover_image_url && (
            <img src={category.cover_image_url} alt={name} className="h-full w-full object-cover" />
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
        {(description || longContent) ? (
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: nl2br(description || longContent) }} />
        ) : (
          <div className="prose max-w-none text-muted-foreground">
            <p>Detailed content coming soon.</p>
          </div>
        )}

        {galleryImages.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Gallery</h2>
            <GalleryGrid images={galleryImages} locale={locale} />
          </div>
        )}
      </div>

      <div className="mt-12">
        <Link href={`/${locale}/health`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> {t('common.backTo')} {t('navigation.health')}
        </Link>
      </div>
    </div>
  );
}
