import { getTranslations } from 'next-intl/server';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';
import { getTestimonials } from '@/lib/queries/testimonials';
import { getLocalizedField } from '@/lib/localization';

export default async function TestimonialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const testimonials = await getTestimonials();

  return (
    <>
      <PageHeader title={t('navigation.testimonials')} subtitle="Hear from our students and community members" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground">Testimonials will appear once added via the admin dashboard.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.id} className="bg-card">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex gap-0.5 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < (item.rating || 5) ? 'fill-current' : 'text-muted'}`} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    &ldquo;{getLocalizedField(item, 'content', locale)}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{item.author_name}</p>
                    {item.author_title && <p className="text-xs text-muted-foreground">{item.author_title}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
