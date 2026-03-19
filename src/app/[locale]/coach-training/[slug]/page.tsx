import { ArrowLeft, Clock, Users, Award, Check } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getProgram } from '@/lib/queries/programs';
import { getLocalizedField } from '@/lib/localization';

export default async function ProgramDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const program = await getProgram(slug);

  if (!program) notFound();

  const name = getLocalizedField(program, 'name', locale) || program.name_en;
  const description = getLocalizedField(program, 'description', locale) || '';
  const longContent = getLocalizedField(program, 'long_content', locale) || '';
  const priceLabel = program.price ? `${program.currency} ${program.price}` : t('common.free');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: t('navigation.coachTraining'), href: `/${locale}/coach-training` }, { label: name }]} />

      <div className="mt-8 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
            {program.cover_image_url && (
              <img src={program.cover_image_url} alt={name} className="h-full w-full object-cover" />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
          {description && <p className="text-lg text-muted-foreground">{description}</p>}
          {longContent ? (
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: longContent }} />
          ) : null}

          {program.what_you_learn?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">What You&apos;ll Learn</h2>
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
              <h2 className="text-xl font-bold mb-4">Prerequisites</h2>
              <ul className="space-y-2">
                {program.prerequisites.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardContent className="space-y-4 pt-6">
              <div className="text-3xl font-bold text-primary">{priceLabel}</div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {program.duration && (
                  <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-primary" />{program.duration}</div>
                )}
                {program.max_participants && (
                  <div className="flex items-center gap-3"><Users className="h-4 w-4 text-primary" />Max {program.max_participants} participants</div>
                )}
                <div className="flex items-center gap-3"><Award className="h-4 w-4 text-primary" />Certificate included</div>
              </div>
              <Button className="w-full" size="lg">{t('common.enrollNow')}</Button>
              <p className="text-xs text-center text-muted-foreground">Secure your spot — limited availability</p>
            </CardContent>
          </Card>
          <Link href={`/${locale}/coach-training`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> {t('common.backTo')} {t('navigation.coachTraining')}
          </Link>
        </div>
      </div>
    </div>
  );
}
