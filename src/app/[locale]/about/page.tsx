import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Target, Compass, Heart, HandHeart } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'About Us | Infinity Role Teachers',
    description: 'Learn about our mission, vision, and the values that guide the Infinity Role Teachers community.',
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  const [mission, vision, donate, volunteer] = await Promise.all([
    getPage('mission'),
    getPage('vision'),
    getPage('donate'),
    getPage('volunteer'),
  ]);

  const pages = { mission, vision, donate, volunteer };

  const cardDefs = [
    { slug: 'mission', fallbackTitle: 'Our Mission', fallbackExcerpt: 'Discover the purpose and driving force behind everything we do.', icon: Target, gradient: 'from-primary/10 via-primary/5 to-secondary/10' },
    { slug: 'vision', fallbackTitle: 'Our Vision', fallbackExcerpt: 'Explore the future we envision and the path we walk together.', icon: Compass, gradient: 'from-secondary/10 via-secondary/5 to-primary/10' },
    { slug: 'donate', fallbackTitle: 'Donate', fallbackExcerpt: 'Support our work and help us build a home for the seeker.', icon: Heart, gradient: 'from-rose-50 via-primary/5 to-secondary/10 dark:from-rose-950/20' },
    { slug: 'volunteer', fallbackTitle: 'Volunteer', fallbackExcerpt: 'Join our community and contribute your time and skills.', icon: HandHeart, gradient: 'from-emerald-50 via-primary/5 to-secondary/10 dark:from-emerald-950/20' },
  ];

  const cards = cardDefs.map((def) => {
    const page = pages[def.slug as keyof typeof pages];
    return {
      slug: def.slug,
      title: page ? (getLocalizedField(page, 'title', locale) || page.title_en) : def.fallbackTitle,
      excerpt: page
        ? (getLocalizedField(page, 'meta_description', locale) || page.meta_description_en || def.fallbackExcerpt)
        : def.fallbackExcerpt,
      image: page?.hero_image_url,
      icon: def.icon,
      gradient: def.gradient,
    };
  });

  return (
    <>
      <PageHeader
        title="About Us"
        subtitle="Learn about our mission, vision, and the values that guide our community"
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.slug} href={`/${locale}/about/${card.slug}`} className="group">
                <Card className="h-full overflow-hidden border-transparent shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                  {card.image ? (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{card.title}</h2>
                      </div>
                    </div>
                  ) : (
                    <div className={`bg-gradient-to-br ${card.gradient} p-8`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">{card.title}</h2>
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {card.excerpt || 'Content coming soon.'}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:gap-3">
                      {t('common.learnMore')}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
