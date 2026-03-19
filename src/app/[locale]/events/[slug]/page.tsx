import { useTranslations } from 'next-intl';
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function EventDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: 'Events', href: `/${locale}/events` }, { label: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }]} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10" />
          <h1 className="text-3xl font-bold">{slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h1>
          <div className="prose max-w-none text-muted-foreground">
            <p>Event details will be loaded from Supabase when the database is connected. This page will display the full event description, schedule, teacher information, and registration form.</p>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary" /><span>Date TBD</span></div>
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" /><span>Time TBD</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /><span>Location TBD</span></div>
                <div className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" /><span>Spots available</span></div>
              </div>
              <div className="border-t pt-4">
                <div className="text-2xl font-bold text-primary">CHF 0</div>
              </div>
              <Button className="w-full" size="lg">Register Now</Button>
            </CardContent>
          </Card>
          <Link href={`/${locale}/events`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
}
