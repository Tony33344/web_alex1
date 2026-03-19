import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Heart, Sun, Brain, Dumbbell, Hand, Leaf, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function HealthPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations();

  const categories = [
    { icon: Leaf, title: 'Nutrition', slug: 'nutrition', description: 'Nourish your body with mindful eating practices and holistic nutrition guidance.' },
    { icon: Heart, title: 'Yoga', slug: 'yoga', description: 'Balance body, mind, and spirit through ancient yogic practices adapted for modern life.' },
    { icon: Sun, title: 'Sunyoga', slug: 'sunyoga', description: 'Harness the healing energy of the sun through this transformative practice.' },
    { icon: Brain, title: 'Meditation', slug: 'meditation', description: 'Cultivate inner peace, clarity, and awareness through guided meditation techniques.' },
    { icon: Dumbbell, title: 'Power Training', slug: 'power-training', description: 'Build strength with conscious movement and body-weight exercises.' },
    { icon: Hand, title: 'Acupresura', slug: 'acupresura', description: 'Activate natural healing points for holistic wellbeing and pain relief.' },
  ];

  return (
    <>
      <PageHeader title={t('navigation.health')} subtitle="Six pillars of holistic health and transformation" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`health/${cat.slug}`}>
              <Card className="group h-full cursor-pointer border-transparent bg-muted/50 transition-all hover:border-primary/20 hover:bg-card hover:shadow-lg">
                <CardContent className="flex flex-col items-center gap-5 pt-10 pb-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <cat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{cat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
                  <span className="mt-auto flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Learn More <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
