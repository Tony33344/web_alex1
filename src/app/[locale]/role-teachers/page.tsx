import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { getTeachers } from '@/lib/queries/teachers';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { createBriefDescription } from '@/lib/utils/html';

export default async function RoleTeachersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const [teachers, page] = await Promise.all([
    getTeachers(),
    getPage('role-teachers'),
  ]);

  const pageTitle = page ? getLocalizedField(page, 'title', locale) || t('navigation.meetTeachers') : t('navigation.meetTeachers');
  const pageContent = page ? getLocalizedField(page, 'content', locale) || '' : '';

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageContent} backgroundColor={page?.background_color} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {teachers.length === 0 ? (
          <p className="text-center text-muted-foreground">No teachers found. Content will appear once added via the admin dashboard.</p>
        ) : (
          <div className="space-y-16">
            {teachers.map((teacher, i) => (
              <div key={teacher.slug} className={`grid items-center gap-12 lg:grid-cols-2 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={`aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  {teacher.photo_url && (
                    <img src={teacher.photo_url} alt={teacher.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold">{teacher.name}</h2>
                    <p className="mt-1 text-lg text-primary">
                      {getLocalizedField(teacher, 'title', locale) || 'Role Teacher'}
                    </p>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {createBriefDescription(getLocalizedField(teacher, 'short_bio', locale) || getLocalizedField(teacher, 'bio', locale), 300)}
                  </p>
                  {teacher.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teacher.specialties.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  )}
                  <Link href={`/${locale}/role-teachers/${teacher.slug}`}>
                    <Button className="gap-2">
                      {t('common.learnMore')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
