import type { Metadata } from 'next';
import { ArrowLeft, Clock, Users, Award, Check, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { GalleryGrid } from '@/components/shared/GalleryGrid';
import { PriceTag } from '@/components/shared/PriceTag';
import { getProgram } from '@/lib/queries/programs';
import { getGalleryImages } from '@/lib/queries/gallery';
import { getLocalizedField } from '@/lib/localization';
import { formatDateRange, formatDateRangeWithTime, parseDurationDays, computeEndDate } from '@/lib/utils/dates';
import { getActivePricing } from '@/lib/utils/pricing';
import { EnrollButtonClient } from '@/components/sections/EnrollButtonClient';
import { SmartImage } from '@/components/shared/SmartImage';

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
  const pricing = getActivePricing(program);
  const galleryImages = await getGalleryImages('program', program.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.coachTraining'), href: `/${locale}/coach-training` }, { label: name }]} />

      {/* Main Image — adapts to landscape/portrait */}
      {(program.image_url || program.cover_image_url) && (
        <SmartImage src={program.image_url || program.cover_image_url || ''} alt={name} className="mt-8" />
      )}

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
          {(description || longContent) ? (
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: description || longContent }} />
          ) : null}

          {program.what_you_learn?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('programs.whatYoullLearn')}</h2>
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
              <h2 className="text-xl font-bold mb-4">{t('programs.requirements')}</h2>
              <ul className="space-y-2">
                {program.prerequisites.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar - 1/3 width - Sticky with Price + Gallery */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <PriceTag pricing={pricing} freeLabel={t('common.free')} locale={locale} size="lg" />
              <div className="space-y-3 text-sm text-muted-foreground">
                {program.start_date && (() => {
                  const days = parseDurationDays(program.duration);
                  const end = program.end_date || (days && days > 1 ? computeEndDate(program.start_date, days).toISOString() : null);
                  return (
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary" />{formatDateRangeWithTime(program.start_date, end, locale)}</div>
                  );
                })()}
                {program.location && (
                  <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" />{program.location}</div>
                )}
                {program.duration && (
                  <div className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="whitespace-pre-line">{program.duration}</span></div>
                )}
                {program.max_participants && (
                  <div className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" />{t('programs.maxParticipants', { count: program.max_participants })}</div>
                )}
                <div className="flex items-center gap-3"><Award className="h-4 w-4 text-primary" />{t('programs.certificateIncluded')}</div>
              </div>
              <EnrollButtonClient locale={locale} programId={program.id} label={t('common.enrollNow')} stripepriceId={pricing.activeStripePriceId} price={pricing.activePrice} currency={pricing.currency} programName={name} />
              <p className="text-xs text-center text-muted-foreground">{t('programs.secureSpot')}</p>
            </CardContent>
          </Card>

          {/* Gallery in sidebar */}
          {galleryImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('programs.gallery')}</h3>
              <GalleryGrid images={galleryImages} locale={locale} />
            </div>
          )}

          <Link href={`/${locale}/coach-training`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('programs.backToCoachTraining')}
          </Link>
        </div>
      </div>
    </div>
  );
}
