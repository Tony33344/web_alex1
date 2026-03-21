import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Sun, Brain, Dumbbell, Hand, Leaf, Star, Calendar, BookOpen, Users, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTeachers } from '@/lib/queries/teachers';
import { getPrograms } from '@/lib/queries/programs';
import { getBlogPosts } from '@/lib/queries/blog';
import { getTestimonials } from '@/lib/queries/testimonials';
import { getFeaturedEvent } from '@/lib/queries/events';
import { getHealthCategories } from '@/lib/queries/health';
import { getLocalizedField } from '@/lib/localization';
import { NewsletterSection } from '@/components/sections/NewsletterSection';

const healthIconMap: Record<string, LucideIcon> = { Leaf, Sun, Heart, Brain, Dumbbell, Hand };

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  const [teachers, programs, { posts }, testimonials, featuredEvent, healthCategories] = await Promise.all([
    getTeachers(),
    getPrograms(),
    getBlogPosts({ limit: 3 }),
    getTestimonials({ featured: true }),
    getFeaturedEvent(),
    getHealthCategories(),
  ]);

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
                <Link href={`/${locale}/coach-training`}>
                  <Button size="lg" className="gap-2">
                    {t('home.explorePrograms')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/membership`}>
                  <Button size="lg" variant="outline" className="gap-2">
                    {t('home.joinMembership')}
                  </Button>
                </Link>
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
      {teachers.length > 0 && (
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.meetTeachersTitle')}</h2>
              <p className="mt-4 text-muted-foreground">Discover the wisdom and guidance of our expert Role Teachers</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher) => (
                <Link key={teacher.slug} href={`/${locale}/role-teachers/${teacher.slug}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="aspect-[4/5] bg-gradient-to-br from-primary/10 to-secondary/10">
                      {teacher.photo_url && <img src={teacher.photo_url} alt={teacher.name} className="h-full w-full object-cover" />}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{teacher.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getLocalizedField(teacher, 'title', locale) || 'Role Teacher'}</p>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {teacher.specialties?.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Holistic Health Approach */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.healthTitle')}</h2>
            <p className="mt-4 text-muted-foreground">Six pillars of health and transformation</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {healthCategories.length > 0 ? healthCategories.map((cat) => {
              const IconComp = (cat.icon_name && healthIconMap[cat.icon_name]) || Heart;
              return (
                <Link key={cat.slug} href={`/${locale}/health/${cat.slug}`}>
                  <Card className="group cursor-pointer border-transparent bg-muted/50 transition-all hover:border-primary/20 hover:bg-card hover:shadow-md">
                    <CardContent className="flex flex-col items-center gap-4 pt-8 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <IconComp className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{getLocalizedField(cat, 'name', locale)}</h3>
                      <p className="text-sm text-muted-foreground">{getLocalizedField(cat, 'description', locale)}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            }) : (
              [
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
              ))
            )}
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
              {featuredEvent ? (
                <>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {getLocalizedField(featuredEvent, 'title', locale)}
                  </h2>
                  <p className="text-lg leading-relaxed text-primary-foreground/80 whitespace-pre-line">
                    {getLocalizedField(featuredEvent, 'description', locale)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-primary-foreground/70">
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(featuredEvent.start_date).toLocaleDateString(locale, { dateStyle: 'long' })}</span>
                    {featuredEvent.max_attendees && (
                      <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {featuredEvent.max_attendees - featuredEvent.current_attendees} spots left</span>
                    )}
                  </div>
                  <Link href={`/${locale}/events/${featuredEvent.slug}`}>
                    <Button variant="secondary" size="lg" className="gap-2">
                      {t('common.registerNow')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Stay Tuned</h2>
                  <p className="text-lg leading-relaxed text-primary-foreground/80">New events are coming soon. Follow us for updates.</p>
                  <Link href={`/${locale}/events`}>
                    <Button variant="secondary" size="lg" className="gap-2">
                      {t('navigation.events')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
            <div className="hidden aspect-video overflow-hidden rounded-2xl bg-primary-foreground/10 lg:block">
              {featuredEvent?.image_url && <img src={featuredEvent.image_url} alt="" className="h-full w-full object-cover" />}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Coach Training Programs */}
      {programs.length > 0 && (
        <section className="bg-background py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.programs')}</h2>
              <p className="mt-4 text-muted-foreground">Become a certified wellness coach</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {programs.slice(0, 3).map((program) => {
                const name = getLocalizedField(program, 'name', locale) || program.name_en;
                const priceLabel = program.price ? `${program.currency} ${program.price}` : t('common.free');
                return (
                  <Link key={program.slug} href={`/${locale}/coach-training/${program.slug}`}>
                    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5">
                        {program.image_url && <img src={program.image_url} alt={name} className="h-full w-full object-cover" />}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg">{name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{program.duration || ''}</span>
                          <span className="font-semibold text-foreground">{priceLabel}</span>
                        </div>
                        <Button variant="outline" className="w-full gap-2">
                          {t('common.learnMore')}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section 7: Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.testimonials')}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 6).map((item) => (
                <Card key={item.id} className="bg-card">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex gap-1 text-secondary">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
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
          </div>
        </section>
      )}

      {/* Section 8: Latest Blog */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.latestBlog')}</h2>
              <p className="mt-2 text-muted-foreground">Insights, stories, and wellness tips</p>
            </div>
            <Link href={`/${locale}/blog`}>
              <Button variant="ghost" className="hidden gap-2 sm:flex">
                {t('home.readAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const title = getLocalizedField(post, 'title', locale) || post.title_en;
                const date = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { dateStyle: 'medium' }) : '';
                return (
                  <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="aspect-video bg-gradient-to-br from-primary/5 to-muted">
                        {post.featured_image_url && <img src={post.featured_image_url} alt={title} className="h-full w-full object-cover" />}
                      </div>
                      <CardHeader>
                        {post.category && <Badge variant="outline" className="w-fit text-xs capitalize">{post.category}</Badge>}
                        <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">{title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{post.reading_time_minutes} min read</span>
                        {date && <><span>&middot;</span><span>{date}</span></>}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Blog posts coming soon.</p>
          )}
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
            <Link href={`/${locale}/membership`}>
              <Button size="lg" className="gap-2">
                {t('common.subscribeNow')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 10: Newsletter */}
      <NewsletterSection
        title={t('home.newsletter')}
        placeholder={t('home.newsletterPlaceholder')}
        buttonLabel={t('home.subscribe')}
      />

      {/* Section 11: Contact CTA */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">{t('home.getInTouch')}</h2>
          <p className="mt-2 text-muted-foreground">Have questions? We&apos;d love to hear from you.</p>
          <div className="mt-6">
            <Link href={`/${locale}/contact`}>
              <Button variant="outline" size="lg" className="gap-2">
                {t('common.contactUs')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
