import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Award, XCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { PaymentSuccessBanner } from '@/components/payments/PaymentSuccessBanner';
import { getPrograms } from '@/lib/queries/programs';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { createBriefDescription } from '@/lib/utils/html';
import { formatDateRange, formatDateRangeWithTime, parseDurationDays, computeEndDate } from '@/lib/utils/dates';
import { getActivePricing } from '@/lib/utils/pricing';
import { PriceTag } from '@/components/shared/PriceTag';

interface CoachTrainingPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment?: string }>;
}

export default async function CoachTrainingPage({ params, searchParams }: CoachTrainingPageProps) {
  const { locale } = await params;
  const { payment } = await searchParams;
  const t = await getTranslations();
  const [programs, page] = await Promise.all([
    getPrograms(),
    getPage('coach-training'),
  ]);

  const pageTitle = page ? getLocalizedField(page, 'title', locale) || t('navigation.coachTraining') : t('navigation.coachTraining');
  const pageContent = page ? getLocalizedField(page, 'content', locale) || '' : '';

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageContent} backgroundColor={page?.background_color} gradientTo={page?.banner_gradient_to} width={page?.banner_width} height={page?.banner_height} />

      <PaymentSuccessBanner
        param="payment"
        title="Enrollment confirmed"
        message="You're enrolled in the program. Check your email for next steps."
      />

      {payment === 'cancelled' && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <XCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Payment cancelled</p>
              <p className="text-sm opacity-90">No worries — you can enroll again anytime.</p>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {programs.length === 0 ? (
          <p className="text-center text-muted-foreground">Programs will appear once added via the admin dashboard.</p>
        ) : (
          <div className="space-y-12">
            {programs.map((program) => {
              const name = getLocalizedField(program, 'name', locale) || program.name_en;
              const description = getLocalizedField(program, 'description', locale) || '';
              const pricing = getActivePricing(program);

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
                        <PriceTag pricing={pricing} freeLabel={t('common.free')} locale={locale} size="lg" />
                      </div>
                      <p className="mt-3 text-muted-foreground line-clamp-3">{createBriefDescription(description, 200)}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {program.start_date && (() => {
                          const days = parseDurationDays(program.duration);
                          const end = program.end_date || (days && days > 1 ? computeEndDate(program.start_date, days).toISOString() : null);
                          return (
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDateRangeWithTime(program.start_date, end, locale)}</span>
                          );
                        })()}
                        {program.duration && (
                          <span className="flex items-start gap-1.5"><Clock className="mt-0.5 h-4 w-4 shrink-0" /><span className="whitespace-pre-line">{program.duration}</span></span>
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
