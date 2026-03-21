import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Heart, Sun, Brain, Dumbbell, Hand, Leaf, ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { getHealthCategories } from '@/lib/queries/health';
import { getLocalizedField } from '@/lib/localization';

const iconMap: Record<string, LucideIcon> = {
  Leaf, Heart, Sun, Brain, Dumbbell, Hand,
};

export default async function HealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const categories = await getHealthCategories();

  return (
    <>
      <PageHeader title={t('navigation.health')} subtitle="Six pillars of holistic health and transformation" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground">Health categories will appear once added via the admin dashboard.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const name = getLocalizedField(cat, 'name', locale) || cat.name_en;
              const description = getLocalizedField(cat, 'description', locale) || '';
              const IconComp = (cat.icon_name && iconMap[cat.icon_name]) || Heart;

              return (
                <Link key={cat.slug} href={`/${locale}/health/${cat.slug}`}>
                  <Card className="group h-full cursor-pointer border-transparent bg-muted/50 transition-all hover:border-primary/20 hover:bg-card hover:shadow-lg">
                    <CardContent className="flex flex-col items-center gap-5 pt-10 pb-8 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <IconComp className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
                      <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        {t('common.learnMore')} <ArrowRight className="h-4 w-4" />
                      </span>
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
