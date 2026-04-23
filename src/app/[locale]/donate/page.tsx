import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { DonateForm } from './DonateForm';

export default async function DonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const donatePage = await getPage('donate');

  const pageTitle = donatePage ? (getLocalizedField(donatePage, 'title', locale) || 'Donate') : 'Donate';
  const pageContent = donatePage ? (getLocalizedField(donatePage, 'content', locale) || '') : '';

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageContent}
        backgroundColor={donatePage?.background_color}
        gradientTo={donatePage?.banner_gradient_to}
        width={donatePage?.banner_width}
        height={donatePage?.banner_height}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <DonateForm locale={locale} />
      </section>
    </>
  );
}
