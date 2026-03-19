import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';

export default function CoachTrainingPage() {
  const t = useTranslations();

  const programs = [
    {
      slug: 'sunyoga-training',
      title: 'Sunyoga Coach Training',
      description: 'Become a certified Sunyoga coach. Learn to guide others through the transformative practice of sun energy healing.',
      duration: '6 months',
      price: 'CHF 2,400',
      maxParticipants: 12,
      features: ['Certified Sunyoga Coach qualification', 'Live and online sessions', 'Mentorship from Avalon', 'Practice materials included'],
      featured: true,
    },
    {
      slug: 'acupresura-training',
      title: 'Acupresura Coach Training',
      description: 'Master the art of acupresura healing. Learn to identify and activate key pressure points for holistic wellness.',
      duration: '3 weekends',
      price: 'CHF 1,800',
      maxParticipants: 15,
      features: ['Certified Acupresura Coach qualification', 'Hands-on practice sessions', 'Anatomy and meridian maps', 'Post-certification support'],
      featured: false,
    },
    {
      slug: 'awaken-inner-compass',
      title: 'Awaken Your Inner Compass',
      description: 'A transformative 8-week journey to discover your true purpose and align your life with your inner wisdom.',
      duration: '8 weeks',
      price: 'CHF 990',
      maxParticipants: 20,
      features: ['Weekly live group sessions', 'Personal journal exercises', 'Guided meditations', '1-on-1 coaching call'],
      featured: false,
    },
  ];

  return (
    <>
      <PageHeader title={t('navigation.coachTraining')} subtitle="Become a certified wellness coach with our transformative programs" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {programs.map((program) => (
            <Card key={program.slug} className="overflow-hidden">
              <div className="grid lg:grid-cols-5">
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 lg:col-span-2 lg:aspect-auto" />
                <div className="p-8 lg:col-span-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {program.featured && <Badge className="mb-3 bg-secondary text-secondary-foreground">Featured Program</Badge>}
                      <CardTitle className="text-2xl">{program.title}</CardTitle>
                    </div>
                    <span className="text-2xl font-bold text-primary">{program.price}</span>
                  </div>
                  <p className="mt-3 text-muted-foreground">{program.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{program.duration}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />Max {program.maxParticipants} participants</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {program.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-primary" />{f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link href={`coach-training/${program.slug}`}>
                      <Button className="gap-2">
                        {t('common.learnMore')} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
