import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { GalleryGrid } from '@/components/shared/GalleryGrid';
import { getEvent } from '@/lib/queries/events';
import { getGalleryImages } from '@/lib/queries/gallery';
import { getLocalizedField } from '@/lib/localization';
import { nl2br } from '@/lib/utils/text';
import { EventRegisterButton } from '@/components/sections/EventRegisterButton';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event Not Found' };
  const title = getLocalizedField(event, 'title', locale) || event.title_en;
  const description = getLocalizedField(event, 'description', locale) || '';
  return {
    title,
    description: description.slice(0, 160),
    openGraph: { title, description: description.slice(0, 160), images: event.image_url ? [event.image_url] : [] },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const event = await getEvent(slug);

  if (!event) notFound();

  const title = getLocalizedField(event, 'title', locale) || event.title_en;
  const description = getLocalizedField(event, 'description', locale) || '';
  const longContent = getLocalizedField(event, 'long_content', locale) || '';
  const startDate = new Date(event.start_date).toLocaleDateString(locale, { dateStyle: 'long' });
  const startTime = new Date(event.start_date).toLocaleTimeString(locale, { timeStyle: 'short' });
  const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;
  const priceLabel = event.price && event.price > 0 ? `${event.currency} ${event.price}` : t('common.free');
  const galleryImages = await getGalleryImages('event', event.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.events'), href: `/${locale}/events` }, { label: title }]} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
            {event.image_url && (
              <img src={event.image_url} alt={title} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{event.is_online ? t('common.online') : t('common.inPerson')}</Badge>
            {event.is_featured && <Badge className="bg-secondary text-secondary-foreground">Featured</Badge>}
            {event.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-lg text-muted-foreground whitespace-pre-line">{description}</p>}
          {longContent && (
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: nl2br(longContent) }} />
          )}

          {galleryImages.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Gallery</h2>
              <GalleryGrid images={galleryImages} locale={locale} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary" /><span>{startDate}</span></div>
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" /><span>{startTime}</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><span>{event.is_online ? 'Online' : event.location || 'TBA'}</span></div>
                {spotsLeft !== null && (
                  <div className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" /><span>{spotsLeft > 0 ? `${spotsLeft} spots left` : t('common.eventFull')}</span></div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="text-2xl font-bold text-primary">{priceLabel}</div>
              </div>
              <EventRegisterButton
                eventId={event.id}
                locale={locale}
                label={t('common.registerNow')}
                isFree={!event.price || event.price <= 0}
                isFull={!!(event.max_attendees && event.current_attendees >= event.max_attendees)}
                price={event.price}
                currency={event.currency}
                eventTitle={title}
              />
            </CardContent>
          </Card>
          <Link href={`/${locale}/events`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('common.backTo')} {t('navigation.events')}
          </Link>
        </div>
      </div>
    </div>
  );
}
