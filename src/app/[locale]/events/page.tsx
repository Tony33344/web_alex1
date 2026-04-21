import { getTranslations } from 'next-intl/server';
import { Calendar, MapPin, Users, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { PaymentSuccessBanner } from '@/components/payments/PaymentSuccessBanner';
import { getEvents } from '@/lib/queries/events';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';

interface EventsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function EventsPage({ params, searchParams }: EventsPageProps) {
  const { locale } = await params;
  const { payment } = await searchParams;
  const t = await getTranslations();
  const [{ events }, page] = await Promise.all([
    getEvents({ upcoming: true }),
    getPage('events'),
  ]);

  const pageTitle = page ? getLocalizedField(page, 'title', locale) || t('navigation.events') : t('navigation.events');
  const pageContent = page ? getLocalizedField(page, 'content', locale) || '' : '';

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageContent} backgroundColor={page?.background_color} gradientTo={page?.banner_gradient_to} width={page?.banner_width} />

      <PaymentSuccessBanner param="payment" />

      {payment === 'cancelled' && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <XCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Payment cancelled</p>
              <p className="text-sm opacity-90">No worries — your spot wasn&apos;t reserved. You can try again anytime.</p>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground">No upcoming events. Check back soon!</p>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">
            {events.map((event) => {
              const title = getLocalizedField(event, 'title', locale) || event.title_en;
              const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;
              const priceLabel = event.price && event.price > 0 ? `${event.currency} ${event.price}` : t('common.free');
              const startDate = new Date(event.start_date).toLocaleDateString(locale, { dateStyle: 'medium' });

              return (
                <Link key={event.id} href={`/${locale}/events/${event.slug}`} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
                  <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
                      {event.image_url && (
                        <img src={event.image_url} alt={title} className="h-full w-full object-cover" />
                      )}
                      {event.is_featured && (
                        <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">Featured</Badge>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{event.is_online ? t('common.online') : t('common.inPerson')}</Badge>
                        <span className="font-semibold text-primary">{priceLabel}</span>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{startDate}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.is_online ? 'Online' : event.location || 'TBA'}</div>
                        {spotsLeft !== null && (
                          <div className="flex items-center gap-2"><Users className="h-4 w-4" />{spotsLeft > 0 ? `${spotsLeft} spots left` : t('common.eventFull')}</div>
                        )}
                      </div>
                      <Button className="w-full">{t('common.registerNow')}</Button>
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
