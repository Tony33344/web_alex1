import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, HandHeart } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { processContent } from '@/lib/utils/text';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage('volunteer');
  const title = page ? (getLocalizedField(page, 'title', locale) || page.title_en) : 'Volunteer';
  const desc = page ? (getLocalizedField(page, 'meta_description', locale) || page.meta_description_en || '') : '';
  return {
    title: `${title} | About`,
    description: desc.slice(0, 160),
    openGraph: { title, description: desc.slice(0, 160), images: page?.hero_image_url ? [page.hero_image_url] : [] },
  };
}

export default async function VolunteerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const page = await getPage('volunteer');

  const title = page ? (getLocalizedField(page, 'title', locale) || page.title_en) : 'Volunteer';
  const content = page ? (getLocalizedField(page, 'content', locale) || page.content_en) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: 'About', href: `/${locale}/about` }, { label: title }]} />

      <div className="mt-8 space-y-10">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl">
          {page?.hero_image_url ? (
            <div className="relative aspect-[21/9]">
              <img src={page.hero_image_url} alt={title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/90">
                    <HandHeart className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Volunteer</span>
                </div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">{title}</h1>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-50 via-primary/5 to-secondary/10 dark:from-emerald-950/20 dark:via-primary/5 dark:to-secondary/10 p-8 sm:p-12 lg:p-16">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <HandHeart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Volunteer</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h1>
            </div>
          )}
        </div>

        {/* Content */}
        {content ? (
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
                dangerouslySetInnerHTML={{ __html: processContent(content) }}
              />
            </div>
            <div className="space-y-4">
              <Card className="border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="font-semibold">Support Our Work</h3>
                  <Link
                    href={`/${locale}/about/donate`}
                    className="flex items-center justify-between rounded-lg border bg-background p-4 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 group"
                  >
                    <span>Make a Donation</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                  <Link
                    href={`/${locale}/about/mission`}
                    className="flex items-center justify-between rounded-lg border bg-background p-4 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 group"
                  >
                    <span>Our Mission</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="flex items-center justify-between rounded-lg border bg-background p-4 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5 group"
                  >
                    <span>Contact Us</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <HandHeart className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Volunteer page content will appear here once published in the admin panel.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
