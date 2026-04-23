import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { getPage } from '@/lib/queries/pages';
import { getPrograms } from '@/lib/queries/programs';
import { getLocalizedField } from '@/lib/localization';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const [homePage, programs] = await Promise.all([
    getPage('home'),
    getPrograms(),
  ]);
  const logoUrl = homePage?.header_logo_url || undefined;
  const programLinks = programs.map((p) => ({
    slug: p.slug,
    label: getLocalizedField(p, 'name', locale) || p.name_en,
  }));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header locale={locale} logoUrl={logoUrl} programs={programLinks} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer locale={locale} />
      <Toaster />
    </NextIntlClientProvider>
  );
}
