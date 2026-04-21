import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { getPage } from '@/lib/queries/pages';
import { getMembershipPlans } from '@/lib/queries/membership';
import { getGalleryImages } from '@/lib/queries/gallery';
import { getLocalizedField } from '@/lib/localization';
import { MembershipClient } from './MembershipClient';
import type { GalleryImage } from '@/types/database';

export const revalidate = 0;

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  
  const [membershipPage, plans] = await Promise.all([
    getPage('membership'),
    getMembershipPlans(),
  ]);

  // Fetch gallery images for each plan server-side
  const galleryMap: Record<string, GalleryImage[]> = {};
  for (const plan of plans) {
    galleryMap[plan.id] = await getGalleryImages('membership', plan.id);
  }

  const pageTitle = (membershipPage && getLocalizedField(membershipPage, 'title', locale)) || t('membership.title');
  const pageContent = (membershipPage && getLocalizedField(membershipPage, 'content', locale)) || '';

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageContent} backgroundColor={membershipPage?.background_color} />
      <MembershipClient 
        plans={plans} 
        pageTitle={pageTitle} 
        pageContent={pageContent}
        locale={locale}
        galleryMap={galleryMap}
      />
    </>
  );
}
