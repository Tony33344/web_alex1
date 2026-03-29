import type { Metadata } from 'next';
import { ArrowLeft, Clock, Users, Award, Check } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { GalleryGrid } from '@/components/shared/GalleryGrid';
import { getProgram } from '@/lib/queries/programs';
import { getGalleryImages } from '@/lib/queries/gallery';
import { getLocalizedField } from '@/lib/localization';
import { EnrollButton } from '@/components/sections/EnrollButton';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const program = await getProgram(slug);
  if (!program) return { title: 'Program Not Found' };
  const name = getLocalizedField(program, 'name', locale) || program.name_en;
  const description = getLocalizedField(program, 'description', locale) || '';
  return {
    title: `${name} | Coach Training`,
    description: description.slice(0, 160),
    openGraph: { title: name, description: description.slice(0, 160), images: program.cover_image_url ? [program.cover_image_url] : [] },
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const program = await getProgram(slug);

  if (!program) notFound();

  const name = getLocalizedField(program, 'name', locale) || program.name_en;
  const description = getLocalizedField(program, 'description', locale) || '';
  const longContent = getLocalizedField(program, 'long_content', locale) || '';
  const priceLabel = program.price ? `${program.currency} ${program.price}` : t('common.free');
  const galleryImages = await getGalleryImages('program', program.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.coachTraining'), href: `/${locale}/coach-training` }, { label: name }]} />

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image - full width */}
          <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
            {program.image_url ? (
              <img src={program.image_url} alt={name} className="h-full w-full object-cover" />
            ) : program.cover_image_url ? (
              <img src={program.cover_image_url} alt={name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
          {(description || longContent) ? (
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: description || longContent }} />
          ) : null}

          {program.what_you_learn?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">What You&apos;ll Learn</h2>
              <ul className="space-y-3">
                {program.what_you_learn.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {program.prerequisites?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Prerequisites</h2>
              <ul className="space-y-2">
                {program.prerequisites.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-4">
          {/* Price & Enroll Card */}
          <Card className="sticky top-24">
            <CardContent className="space-y-4 pt-6">
              <div className="text-3xl font-bold text-primary">{priceLabel}</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {program.duration && (
                  <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" />{program.duration}</div>
                )}
                {program.max_participants && (
                  <div className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" />Max {program.max_participants} participants</div>
                )}
                <div className="flex items-center gap-3"><Award className="h-4 w-4 text-primary" />Certificate included</div>
              </div>
              <EnrollButton locale={locale} programSlug={slug} label={t('common.enrollNow')} stripepriceId={program.stripe_price_id} price={program.price} currency={program.currency} programName={name} />
              <p className="text-xs text-center text-muted-foreground">Secure your spot — limited availability</p>
            </CardContent>
          </Card>

          {/* Gallery in sidebar */}
          {galleryImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gallery</h3>
              <GalleryGrid images={galleryImages} locale={locale} />
            </div>
          )}

          <Link href={`/${locale}/coach-training`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('common.backTo')} {t('navigation.coachTraining')}
          </Link>
        </div>
      </div>
    </div>
  );
}
