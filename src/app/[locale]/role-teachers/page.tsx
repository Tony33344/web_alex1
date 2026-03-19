import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';

export default function RoleTeachersPage() {
  const t = useTranslations();

  const teachers = [
    {
      name: 'Avalon',
      slug: 'avalon',
      title: 'Founder & Lead Teacher',
      shortBio: 'With over 20 years of experience in holistic wellness, Avalon guides students toward their infinite potential through Sunyoga, meditation, and transformative coaching.',
      specialties: ['Sunyoga', 'Meditation', 'Holistic Healing', 'Life Coaching'],
    },
    {
      name: 'Akasha',
      slug: 'akasha',
      title: 'Senior Teacher',
      shortBio: 'Akasha brings deep expertise in Acupresura and Yoga, helping students discover the healing power within themselves through ancient practices adapted for modern life.',
      specialties: ['Acupresura', 'Yoga', 'Wellness Coaching', 'Nutrition'],
    },
  ];

  return (
    <>
      <PageHeader title={t('navigation.meetTeachers')} subtitle="Discover the wisdom and guidance of our expert Role Teachers" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {teachers.map((teacher, i) => (
            <div key={teacher.slug} className={`grid items-center gap-12 lg:grid-cols-2 ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ${i % 2 === 1 ? 'lg:order-2' : ''}`} />
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold">{teacher.name}</h2>
                  <p className="mt-1 text-lg text-primary">{teacher.title}</p>
                </div>
                <p className="text-muted-foreground leading-relaxed">{teacher.shortBio}</p>
                <div className="flex flex-wrap gap-2">
                  {teacher.specialties.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
                <Button className="gap-2">
                  {t('common.learnMore')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
