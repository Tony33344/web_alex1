import { ArrowLeft, Clock, Users, Award, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function ProgramDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: 'Coach Training', href: `/${locale}/coach-training` }, { label: title }]} />

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10" />
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <div className="prose max-w-none text-muted-foreground">
            <p>Program content will be loaded from Supabase when the database is connected. This page displays the full program description, curriculum, prerequisites, what you&apos;ll learn, and enrollment information.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">What You&apos;ll Learn</h2>
            <ul className="space-y-3">
              {['Foundation principles and philosophy', 'Practical techniques and methods', 'Teaching and coaching methodology', 'Business and certification requirements'].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardContent className="space-y-4 pt-6">
              <div className="text-3xl font-bold text-primary">CHF 0</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" />Duration TBD</div>
                <div className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" />Limited spots</div>
                <div className="flex items-center gap-3"><Award className="h-4 w-4 text-primary" />Certificate included</div>
              </div>
              <Button className="w-full" size="lg">Enroll Now</Button>
              <p className="text-xs text-center text-muted-foreground">Secure your spot — limited availability</p>
            </CardContent>
          </Card>
          <Link href={`/${locale}/coach-training`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Programs
          </Link>
        </div>
      </div>
    </div>
  );
}
