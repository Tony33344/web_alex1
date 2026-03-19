import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TestimonialsPage() {
  const t = useTranslations();

  const testimonials = [
    { name: 'Anna K.', role: 'Sunyoga Graduate', text: 'The Sunyoga training transformed my entire approach to wellness. I am forever grateful for the guidance I received.', rating: 5 },
    { name: 'Michael R.', role: 'Coach Trainee', text: 'Incredible teachers, incredible program. The coaching certification has opened new doors for me professionally and personally.', rating: 5 },
    { name: 'Sarah L.', role: 'Member', text: 'A truly transformative experience. The community here is warm, supportive, and inspiring.', rating: 5 },
    { name: 'Thomas W.', role: 'Wellness Student', text: 'The acupresura sessions changed my life. I now practice daily and share the techniques with my family.', rating: 4 },
    { name: 'Priya S.', role: 'Online Member', text: 'Even participating online, I feel deeply connected to the teachings and the community. Wonderful experience.', rating: 5 },
    { name: 'Marco B.', role: 'Retreat Participant', text: 'The retreat was beyond my expectations. The setting, the teachings, the people — everything was perfect.', rating: 5 },
  ];

  return (
    <>
      <PageHeader title={t('navigation.testimonials')} subtitle="Hear from our students and community members" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <Card key={item.name} className="bg-card">
              <CardContent className="space-y-4 pt-6">
                <div className="flex gap-0.5 text-secondary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'fill-current' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">&ldquo;{item.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
