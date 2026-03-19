import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Sun, Brain, Dumbbell, Hand, Leaf, Star, Calendar, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();

  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 75% 50%, var(--secondary) 0%, transparent 50%)' }} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">Welcome to Infinity Role Teachers</Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {t('home.heroTitle')}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  {t('home.explorePrograms')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  {t('home.joinMembership')}
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-3xl bg-primary/5 shadow-2xl">
                <Image
                  src="/logo/logo.jpeg"
                  alt="Infinity Role Teachers"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mission & Vision */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border bg-card p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Sun className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{t('home.missionTitle')}</h2>
              <p className="leading-relaxed text-muted-foreground">
                To empower individuals on their journey toward holistic wellness by providing transformative education, authentic healing practices, and a supportive global community guided by experienced Role Teachers.
              </p>
            </div>
            <div className="space-y-4 rounded-2xl border bg-card p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                <Star className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h2 className="text-2xl font-bold">{t('home.visionTitle')}</h2>
              <p className="leading-relaxed text-muted-foreground">
                A world where everyone has access to the ancient wisdom and modern practices needed to achieve balance, health, and their infinite potential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Meet Your Role Teachers */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.meetTeachersTitle')}</h2>
            <p className="mt-4 text-muted-foreground">Discover the wisdom and guidance of our expert Role Teachers</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Avalon', role: 'Founder & Lead Teacher', specialties: ['Sunyoga', 'Meditation', 'Holistic Healing'] },
              { name: 'Akasha', role: 'Senior Teacher', specialties: ['Acupresura', 'Yoga', 'Wellness Coaching'] },
            ].map((teacher) => (
              <Card key={teacher.name} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-[4/5] bg-gradient-to-br from-primary/10 to-secondary/10" />
                <CardHeader>
                  <CardTitle className="text-xl">{teacher.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{teacher.role}</p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {teacher.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Holistic Health Approach */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.healthTitle')}</h2>
            <p className="mt-4 text-muted-foreground">Six pillars of health and transformation</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Leaf, title: 'Nutrition', description: 'Nourish your body with mindful eating practices' },
              { icon: Sun, title: 'Sunyoga', description: 'Harness the healing energy of the sun' },
              { icon: Heart, title: 'Yoga', description: 'Balance body, mind, and spirit through ancient practice' },
              { icon: Brain, title: 'Meditation', description: 'Cultivate inner peace and clarity of mind' },
              { icon: Dumbbell, title: 'Power Training', description: 'Build strength with conscious movement' },
              { icon: Hand, title: 'Acupresura', description: 'Activate healing points for holistic wellbeing' },
            ].map((item) => (
              <Card key={item.title} className="group cursor-pointer border-transparent bg-muted/50 transition-all hover:border-primary/20 hover:bg-card hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-4 pt-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Featured Event */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Badge className="bg-primary-foreground/20 text-primary-foreground">
                {t('home.featuredEvent')}
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Upcoming Sunyoga Retreat
              </h2>
              <p className="text-lg leading-relaxed text-primary-foreground/80">
                Join us for a transformative weekend of Sunyoga practice, meditation, and holistic healing in the heart of nature.
              </p>
              <div className="flex items-center gap-4 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> June 15–17, 2026</span>
                <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 20 spots available</span>
              </div>
              <Button variant="secondary" size="lg" className="gap-2">
                {t('common.registerNow')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="hidden aspect-video overflow-hidden rounded-2xl bg-primary-foreground/10 lg:block" />
          </div>
        </div>
      </section>

      {/* Section 6: Coach Training Programs */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.programs')}</h2>
            <p className="mt-4 text-muted-foreground">Become a certified wellness coach</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: 'Sunyoga Coach Training', duration: '6 months', price: 'CHF 2,400' },
              { title: 'Acupresura Coach Training', duration: '3 weekends', price: 'CHF 1,800' },
              { title: 'Awaken Your Inner Compass', duration: '8 weeks', price: 'CHF 990' },
            ].map((program) => (
              <Card key={program.title} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5" />
                <CardHeader>
                  <CardTitle className="text-lg">{program.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{program.duration}</span>
                    <span className="font-semibold text-foreground">{program.price}</span>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    {t('common.learnMore')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: Testimonials */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.testimonials')}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Anna K.', text: 'The Sunyoga training transformed my entire approach to wellness. I am forever grateful.' },
              { name: 'Michael R.', text: 'Incredible teachers, incredible program. The coaching certification has opened new doors for me.' },
              { name: 'Sarah L.', text: 'A truly transformative experience. The community here is warm, supportive, and inspiring.' },
            ].map((t) => (
              <Card key={t.name} className="bg-card">
                <CardContent className="space-y-4 pt-6">
                  <div className="flex gap-1 text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground italic">&ldquo;{t.text}&rdquo;</p>
                  <p className="text-sm font-semibold">{t.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Latest Blog */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.latestBlog')}</h2>
              <p className="mt-2 text-muted-foreground">Insights, stories, and wellness tips</p>
            </div>
            <Button variant="ghost" className="hidden gap-2 sm:flex">
              {t('home.readAll')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-muted" />
                <CardHeader>
                  <Badge variant="outline" className="w-fit text-xs">Wellness</Badge>
                  <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">
                    The Power of Morning Rituals for Holistic Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>5 min read</span>
                  <span>&middot;</span>
                  <span>Jan 15, 2026</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Membership CTA */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.membershipCta')}</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Unlock exclusive content, member-only events, and special discounts on all programs.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              {t('common.subscribeNow')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section 10: Newsletter */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">{t('home.newsletter')}</h2>
          <p className="mt-2 text-muted-foreground">Stay updated with our latest news, events, and wellness tips</p>
          <form className="mt-6 flex gap-2">
            <input
              type="email"
              placeholder={t('home.newsletterPlaceholder')}
              className="flex-1 rounded-md border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button type="submit">{t('home.subscribe')}</Button>
          </form>
        </div>
      </section>

      {/* Section 11: Contact CTA */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">{t('home.getInTouch')}</h2>
          <p className="mt-2 text-muted-foreground">Have questions? We&apos;d love to hear from you.</p>
          <div className="mt-6">
            <Button variant="outline" size="lg" className="gap-2">
              {t('common.contactUs')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
