import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, Heart, Sun, Brain, Dumbbell, Hand, Leaf, Star, Calendar, BookOpen, Users, Target, Compass, MapPin, Clock, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTeachers } from '@/lib/queries/teachers';
import { getPrograms } from '@/lib/queries/programs';
import { getBlogPosts } from '@/lib/queries/blog';
import { getTestimonials } from '@/lib/queries/testimonials';
import { getFeaturedEvent, getEvents } from '@/lib/queries/events';
import { getHealthCategories } from '@/lib/queries/health';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { nl2br } from '@/lib/utils/text';
import { processHtmlContent, createBriefDescription } from '@/lib/utils/html';
import { NewsletterSection } from '@/components/sections/NewsletterSection';

const healthIconMap: Record<string, LucideIcon> = { Leaf, Sun, Heart, Brain, Dumbbell, Hand };

const colorPalette = [
  { bg: 'from-emerald-500/80 to-teal-600/80',    icon: 'bg-emerald-100 text-emerald-700',  accent: 'text-emerald-300' },
  { bg: 'from-violet-500/80 to-purple-700/80',   icon: 'bg-violet-100 text-violet-700',    accent: 'text-violet-300' },
  { bg: 'from-amber-500/80 to-orange-600/80',    icon: 'bg-amber-100 text-amber-700',      accent: 'text-amber-300' },
  { bg: 'from-sky-500/80 to-blue-700/80',        icon: 'bg-sky-100 text-sky-700',          accent: 'text-sky-300' },
  { bg: 'from-rose-500/80 to-pink-700/80',       icon: 'bg-rose-100 text-rose-700',        accent: 'text-rose-300' },
  { bg: 'from-lime-500/80 to-green-700/80',      icon: 'bg-lime-100 text-lime-700',        accent: 'text-lime-300' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  const [teachers, programs, { posts }, testimonials, featuredEvent, { events: upcomingEvents }, healthCategories, missionPage, visionPage, homePage, healthPage, roleTeachersPage, coachTrainingPage, blogPage, membershipPage, contactPage] = await Promise.all([
    getTeachers(),
    getPrograms(),
    getBlogPosts({ limit: 3 }),
    getTestimonials({ featured: true }),
    getFeaturedEvent(),
    getEvents({ upcoming: true, limit: 6 }),
    getHealthCategories(),
    getPage('mission'),
    getPage('vision'),
    getPage('home'),
    getPage('health'),
    getPage('role-teachers'),
    getPage('coach-training'),
    getPage('blog'),
    getPage('membership'),
    getPage('contact'),
  ]);

  return (
    <>
      {/* Section 1: Hero */}
      <section className="relative flex items-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, var(--primary) 0%, transparent 50%), radial-gradient(circle at 75% 50%, var(--secondary) 0%, transparent 50%)' }} />
        <div className="relative z-10 mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">Welcome to Infinity Role Teachers</Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {(homePage && getLocalizedField(homePage, 'title', locale)) || t('home.heroTitle')}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {(homePage && getLocalizedField(homePage, 'meta_description', locale)) || t('home.heroSubtitle')}
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
            <div className="hidden lg:flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={homePage?.hero_image_url || "/logo/logo.jpeg"}
                alt="Infinity Role Teachers"
                className="max-w-md w-full object-contain"
                style={{ background: 'transparent' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 1b: Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="bg-background py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Centered title with accent band */}
            <div className="mb-10 text-center">
              <Badge variant="secondary" className="mb-3">Upcoming</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('navigation.events')}</h2>
              <p className="mt-2 text-muted-foreground">Secure your spot — limited availability</p>
              {/* Accent band */}
              <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-secondary to-primary" />
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {upcomingEvents.map((event) => {
                const evtTitle = getLocalizedField(event, 'title', locale) || event.title_en;
                const spotsLeft = event.max_attendees ? event.max_attendees - event.current_attendees : null;
                const priceLabel = event.price && event.price > 0 ? `${event.currency} ${event.price}` : t('common.free');
                const startDate = new Date(event.start_date).toLocaleDateString(locale, { dateStyle: 'medium' });
                return (
                  <Link key={event.id} href={`/${locale}/events/${event.slug}`} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
                    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
                        {event.image_url && (
                          <img src={event.image_url} alt={evtTitle} className="h-full w-full object-cover" />
                        )}
                        {event.is_featured && (
                          <Badge className="absolute left-3 top-3 bg-secondary text-secondary-foreground">Featured</Badge>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{event.is_online ? t('common.online') : t('common.inPerson')}</Badge>
                          <span className="font-semibold text-primary">{priceLabel}</span>
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{evtTitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{startDate}</div>
                          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.is_online ? 'Online' : event.location || 'TBA'}</div>
                          {spotsLeft !== null && (
                            <div className={`flex items-center gap-2 ${spotsLeft <= 10 ? 'text-destructive font-medium' : ''}`}><Users className="h-4 w-4" />{spotsLeft > 0 ? `${spotsLeft} spots left` : t('common.eventFull')}</div>
                          )}
                        </div>
                        <Button className="w-full">{t('common.registerNow')}</Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Section 2: About Us — Mission & Vision */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Centered title with accent band */}
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3">About Us</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('home.aboutTitle') || 'Our Purpose'}</h2>
            <p className="mt-2 text-muted-foreground">{t('home.aboutSubtitle') || 'Discover what drives us forward'}</p>
            {/* Accent band */}
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-primary via-secondary to-primary" />
          </div>
          <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-2">
            {/* Mission Card */}
            <Link href={`/${locale}/about/mission`} className="group">
              <Card className="h-full overflow-hidden border-transparent shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                {missionPage?.hero_image_url ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={missionPage.hero_image_url}
                      alt={getLocalizedField(missionPage, 'title', locale) || 'Our Mission'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Target className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-tight">{t('home.missionTitle')}</h2>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">{t('home.missionTitle')}</h2>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    To empower individuals on their journey toward holistic wellness by providing transformative education, authentic healing practices, and a supportive global community guided by experienced Role Teachers.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:gap-3">
                    {t('common.learnMore')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Vision Card */}
            <Link href={`/${locale}/about/vision`} className="group">
              <Card className="h-full overflow-hidden border-transparent shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/20">
                {visionPage?.hero_image_url ? (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={visionPage.hero_image_url}
                      alt={getLocalizedField(visionPage, 'title', locale) || 'Our Vision'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <Compass className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-tight">{t('home.visionTitle')}</h2>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-primary/10 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20 mb-3">
                      <Compass className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <h2 className="text-lg font-bold tracking-tight">{t('home.visionTitle')}</h2>
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    A world where everyone has access to the ancient wisdom and modern practices needed to achieve balance, health, and their infinite potential.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary transition-colors group-hover:gap-3">
                    {t('common.learnMore')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Meet Your Role Teachers */}
      {teachers.length > 0 && (
        <section className="bg-muted/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {(roleTeachersPage && getLocalizedField(roleTeachersPage, 'title', locale)) || t('home.meetTeachersTitle')}
              </h2>
              <div className="mt-4 prose prose-lg max-w-3xl mx-auto dark:prose-invert">
                {(roleTeachersPage && getLocalizedField(roleTeachersPage, 'content', locale)) ? (
                  <div dangerouslySetInnerHTML={{ __html: getLocalizedField(roleTeachersPage, 'content', locale) || '' }} />
                ) : (
                  <p className="text-muted-foreground">Discover the wisdom and guidance of our expert Role Teachers</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {teachers.map((teacher) => (
                <Link key={teacher.slug} href={`/${locale}/role-teachers/${teacher.slug}`} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {(healthPage && getLocalizedField(healthPage, 'title', locale)) || t('home.healthTitle')}
            </h2>
            <div className="mt-4 prose prose-lg max-w-3xl mx-auto dark:prose-invert">
              {(healthPage && getLocalizedField(healthPage, 'content', locale)) ? (
                <div dangerouslySetInnerHTML={{ __html: getLocalizedField(healthPage, 'content', locale) || '' }} />
              ) : (
                <p className="text-muted-foreground">Six pillars of health and transformation</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {healthCategories.length > 0 ? healthCategories.map((cat, i) => {
              const IconComp = (cat.icon_name && healthIconMap[cat.icon_name]) || Heart;
              const palette = colorPalette[i % colorPalette.length];
              return (
                <Link key={cat.slug} href={`/${locale}/health/${cat.slug}`} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
                  <div className="overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl bg-card ring-1 ring-foreground/10">
                    {/* Image or gradient header */}
                    <div className="relative h-44 overflow-hidden">
                      {cat.cover_image_url ? (
                        <img
                          src={cat.cover_image_url}
                          alt={getLocalizedField(cat, 'name', locale) || cat.name_en}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${palette.bg}`} />
                      )}
                      {/* Subtle bottom fade into card */}
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                      {/* Icon badge */}
                      <div className={`absolute left-4 bottom-2 flex h-12 w-12 items-center justify-center rounded-xl ${palette.icon} shadow-md ring-2 ring-card`}>
                        <IconComp className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Text content */}
                    <div className="px-5 pt-8 pb-5">
                      <h3 className="text-lg font-bold">{getLocalizedField(cat, 'name', locale) || cat.name_en}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{createBriefDescription(getLocalizedField(cat, 'description', locale), 120)}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all duration-200 group-hover:gap-2.5">
                        {t('common.learnMore')} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            }) : (
              [
                { icon: Leaf, title: 'Nutrition', description: 'Nourish your body with mindful eating practices' },
                { icon: Sun, title: 'Sunyoga', description: 'Harness the healing energy of the sun' },
                { icon: Heart, title: 'Yoga', description: 'Balance body, mind, and spirit through ancient practice' },
                { icon: Brain, title: 'Meditation', description: 'Cultivate inner peace and clarity of mind' },
                { icon: Dumbbell, title: 'Power Training', description: 'Build strength with conscious movement' },
                { icon: Hand, title: 'Acupressure', description: 'Activate healing points for holistic wellbeing' },
              ].map((item, i) => {
                const palette = colorPalette[i % colorPalette.length];
                return (
                  <div key={item.title} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
                    <div className="overflow-hidden rounded-2xl shadow-md bg-card ring-1 ring-foreground/10">
                      {/* Gradient header */}
                      <div className="relative h-44 overflow-hidden">
                        <div className={`h-full w-full bg-gradient-to-br ${palette.bg}`} />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
                        <div className={`absolute left-4 bottom-2 flex h-12 w-12 items-center justify-center rounded-xl ${palette.icon} shadow-md ring-2 ring-card`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="px-5 pt-8 pb-5">
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })
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
                  <p className="text-lg leading-relaxed text-primary-foreground/80">
                    {getLocalizedField(featuredEvent, 'brief_description', locale) || createBriefDescription(getLocalizedField(featuredEvent, 'description', locale))}
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
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {(coachTrainingPage && getLocalizedField(coachTrainingPage, 'title', locale)) || t('home.programs')}
              </h2>
              <div className="mt-4 prose prose-lg max-w-3xl mx-auto dark:prose-invert">
                {(coachTrainingPage && getLocalizedField(coachTrainingPage, 'content', locale)) ? (
                  <div dangerouslySetInnerHTML={{ __html: getLocalizedField(coachTrainingPage, 'content', locale) || '' }} />
                ) : (
                  <p className="text-muted-foreground">Become a certified wellness coach</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {programs.slice(0, 3).map((program) => {
                const name = getLocalizedField(program, 'name', locale) || program.name_en;
                const priceLabel = program.price ? `${program.currency} ${program.price}` : t('common.free');
                return (
                  <Link key={program.slug} href={`/${locale}/coach-training/${program.slug}`} className="w-full md:w-[calc(33.333%-1.5rem)]">
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
            <div className="flex flex-wrap justify-center gap-6">
              {testimonials.slice(0, 6).map((item) => (
                <div key={item.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
                  <Card className="bg-card h-full">
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex gap-1 text-secondary">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground italic">
                        &ldquo;{createBriefDescription(getLocalizedField(item, 'content', locale), 250)}&rdquo;
                      </p>
                      <div>
                        <p className="text-sm font-semibold">{item.author_name}</p>
                        {item.author_title && <p className="text-xs text-muted-foreground">{item.author_title}</p>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {(blogPage && getLocalizedField(blogPage, 'title', locale)) || t('home.latestBlog')}
              </h2>
              <div className="mt-2 prose dark:prose-invert">
                {(blogPage && getLocalizedField(blogPage, 'content', locale)) ? (
                  <div dangerouslySetInnerHTML={{ __html: getLocalizedField(blogPage, 'content', locale) || '' }} />
                ) : (
                  <p className="text-muted-foreground">Insights, stories, and wellness tips</p>
                )}
              </div>
            </div>
            <Link href={`/${locale}/blog`}>
              <Button variant="ghost" className="hidden gap-2 sm:flex">
                {t('home.readAll')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {posts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
              {posts.map((post) => {
                const title = getLocalizedField(post, 'title', locale) || post.title_en;
                const date = post.published_at ? new Date(post.published_at).toLocaleDateString(locale, { dateStyle: 'medium' }) : '';
                return (
                  <Link key={post.id} href={`/${locale}/blog/${post.slug}`} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]">
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {(membershipPage && getLocalizedField(membershipPage, 'title', locale)) || t('home.membershipCta')}
          </h2>
          <div className="mt-4 prose prose-lg dark:prose-invert mx-auto">
            {(membershipPage && getLocalizedField(membershipPage, 'content', locale)) ? (
              <div dangerouslySetInnerHTML={{ __html: getLocalizedField(membershipPage, 'content', locale) || '' }} />
            ) : (
              <p className="text-muted-foreground">
                Unlock exclusive content, member-only events, and special discounts on all programs.
              </p>
            )}
          </div>
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
          <h2 className="text-2xl font-bold tracking-tight">
            {(contactPage && getLocalizedField(contactPage, 'title', locale)) || t('home.getInTouch')}
          </h2>
          <div className="mt-2 prose dark:prose-invert mx-auto">
            {(contactPage && getLocalizedField(contactPage, 'content', locale)) ? (
              <div dangerouslySetInnerHTML={{ __html: getLocalizedField(contactPage, 'content', locale) || '' }} />
            ) : (
              <p className="text-muted-foreground">Have questions? We&apos;d love to hear from you.</p>
            )}
          </div>
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
