import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPrograms } from '@/lib/queries/programs';
import { getLocalizedField } from '@/lib/localization';

export default async function CoachTrainingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const programs = await getPrograms();

  return (
    <>
      <PageHeader title={t('navigation.coachTraining')} subtitle="Become a certified wellness coach with our transformative programs" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {programs.length === 0 ? (
          <p className="text-center text-muted-foreground">Programs will appear once added via the admin dashboard.</p>
        ) : (
          <div className="space-y-12">
            {programs.map((program) => {
              const name = getLocalizedField(program, 'name', locale) || program.name_en;
              const description = getLocalizedField(program, 'description', locale) || '';
              const priceLabel = program.price ? `${program.currency} ${program.price}` : t('common.free');

              return (
                <Card key={program.slug} className="overflow-hidden">
                  <div className="grid lg:grid-cols-5">
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 lg:col-span-2 lg:aspect-auto">
                      {program.image_url && (
                        <img src={program.image_url} alt={name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-8 lg:col-span-3">
                      <div className="flex items-start justify-between">
                        <div>
                          {program.is_featured && <Badge className="mb-3 bg-secondary text-secondary-foreground">Featured Program</Badge>}
                          <CardTitle className="text-2xl">{name}</CardTitle>
                        </div>
                        <span className="text-2xl font-bold text-primary">{priceLabel}</span>
                      </div>
                      <p className="mt-3 text-muted-foreground">{description}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {program.duration && (
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{program.duration}</span>
                        )}
                        {program.max_participants && (
                          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />Max {program.max_participants} participants</span>
                        )}
                      </div>
                      {program.what_you_learn?.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {program.what_you_learn.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm">
                              <Award className="h-4 w-4 text-primary" />{f}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-6">
                        <Link href={`/${locale}/coach-training/${program.slug}`}>
                          <Button className="gap-2">
                            {t('common.learnMore')} <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
