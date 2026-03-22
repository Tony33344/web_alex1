import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Heart, Sun, Brain, Dumbbell, Hand, Leaf, ArrowRight, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { getHealthCategories } from '@/lib/queries/health';
import { getLocalizedField } from '@/lib/localization';

const iconMap: Record<string, LucideIcon> = {
  Leaf, Heart, Sun, Brain, Dumbbell, Hand,
};

const colorPalette = [
  { bg: 'from-emerald-500/80 to-teal-600/80',    icon: 'bg-emerald-100 text-emerald-700',  accent: 'text-emerald-300' },
  { bg: 'from-violet-500/80 to-purple-700/80',   icon: 'bg-violet-100 text-violet-700',    accent: 'text-violet-300' },
  { bg: 'from-amber-500/80 to-orange-600/80',    icon: 'bg-amber-100 text-amber-700',      accent: 'text-amber-300' },
  { bg: 'from-sky-500/80 to-blue-700/80',        icon: 'bg-sky-100 text-sky-700',          accent: 'text-sky-300' },
  { bg: 'from-rose-500/80 to-pink-700/80',       icon: 'bg-rose-100 text-rose-700',        accent: 'text-rose-300' },
  { bg: 'from-lime-500/80 to-green-700/80',      icon: 'bg-lime-100 text-lime-700',        accent: 'text-lime-300' },
];

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
          <div className="flex flex-wrap justify-center gap-8">
            {categories.map((cat, i) => {
              const name = getLocalizedField(cat, 'name', locale) || cat.name_en;
              const description = getLocalizedField(cat, 'description', locale) || '';
              const IconComp = (cat.icon_name && iconMap[cat.icon_name]) || Heart;
              const palette = colorPalette[i % colorPalette.length];

              return (
                <Link
                  key={cat.slug}
                  href={`/${locale}/health/${cat.slug}`}
                  className="group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
                >
                  <div className="relative h-72 overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    {/* Background image or gradient */}
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-secondary/40" />
                    )}

                    {/* Color overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${palette.bg} mix-blend-multiply transition-opacity duration-300 group-hover:opacity-90`} />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6">
                      {/* Icon */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${palette.icon} shadow-sm`}>
                        <IconComp className="h-6 w-6" />
                      </div>

                      {/* Text */}
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow">{name}</h3>
                        <p className="mt-1.5 text-sm text-white/80 line-clamp-2 leading-relaxed">{description}</p>
                        <span className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold ${palette.accent} transition-all duration-200 group-hover:gap-2.5`}>
                          {t('common.learnMore')} <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
