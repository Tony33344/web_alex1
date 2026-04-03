import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPage } from '@/lib/queries/pages';
import { getMembershipPlans } from '@/lib/queries/membership';
import { getLocalizedField } from '@/lib/localization';
import { MembershipClient } from './MembershipClient';

export const revalidate = 0;

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  
  // Fetch dynamic content
  const [membershipPage, plans] = await Promise.all([
    getPage('membership'),
    getMembershipPlans(),
  ]);

  const pageTitle = (membershipPage && getLocalizedField(membershipPage, 'title', locale)) || t('membership.title');
  const pageContent = (membershipPage && getLocalizedField(membershipPage, 'content', locale)) || '';

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageContent} />
      <MembershipClient 
        plans={plans} 
        pageTitle={pageTitle} 
        pageContent={pageContent}
        locale={locale}
      />
    </>
  );
}
