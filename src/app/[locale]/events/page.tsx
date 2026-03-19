import { useTranslations } from 'next-intl';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';

export default function EventsPage() {
  const t = useTranslations();

  const placeholderEvents = [
    { id: '1', title: 'Sunyoga Retreat Weekend', date: 'June 15–17, 2026', location: 'Swiss Alps', type: 'In Person', spots: 20, price: 'CHF 350', featured: true },
    { id: '2', title: 'Online Meditation Workshop', date: 'July 5, 2026', location: 'Online', type: 'Online', spots: 50, price: 'Free', featured: false },
    { id: '3', title: 'Acupresura Healing Day', date: 'August 10, 2026', location: 'Zurich, CH', type: 'In Person', spots: 15, price: 'CHF 120', featured: false },
    { id: '4', title: 'Power Training Intensive', date: 'September 1–3, 2026', location: 'Bern, CH', type: 'In Person', spots: 25, price: 'CHF 280', featured: false },
  ];

  return (
    <>
      <PageHeader title={t('navigation.events')} subtitle="Discover our upcoming events, workshops, and retreats" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {placeholderEvents.map((event) => (
            <Card key={event.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
                {event.featured && (
                  <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">Featured</Badge>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{event.type}</Badge>
                  <span className="font-semibold text-primary">{event.price}</span>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{event.date}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" />{event.spots} spots available</div>
                </div>
                <Button className="w-full">{t('common.registerNow')}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
