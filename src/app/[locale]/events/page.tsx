import { getTranslations } from 'next-intl/server';
import { Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { getEvents } from '@/lib/queries/events';
import { getLocalizedField } from '@/lib/localization';

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const { events } = await getEvents({ upcoming: true });

  return (
    <>
      <PageHeader title={t('navigation.events')} subtitle="Discover our upcoming events, workshops, and retreats" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground">No upcoming events. Check back soon!</p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const title = getLocalizedField(event, 'title', locale) || event.title_en;
              const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;
              const priceLabel = event.price && event.price > 0 ? `${event.currency} ${event.price}` : t('common.free');
              const startDate = new Date(event.start_date).toLocaleDateString(locale, { dateStyle: 'medium' });

              return (
                <Link key={event.id} href={`/${locale}/events/${event.slug}`}>
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
