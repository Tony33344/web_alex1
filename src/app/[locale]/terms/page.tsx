import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { processContent } from '@/lib/utils/text';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations();
  const page = await getPage('terms');
  const title = page ? (getLocalizedField(page, 'title', locale) || page.title_en) : t('legal.termsAndConditions');
  const desc = page ? (getLocalizedField(page, 'meta_description', locale) || page.meta_description_en || '') : '';
  return {
    title: `${title} | Infinity Role Teachers`,
    description: desc.slice(0, 160),
    openGraph: { title, description: desc.slice(0, 160) },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const page = await getPage('terms');

  const title = page ? (getLocalizedField(page, 'title', locale) || page.title_en) : t('legal.termsAndConditions');
  const content = page ? (getLocalizedField(page, 'content', locale) || page.content_en) : null;
  const textColor = page?.text_color || '#1a1a1a';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: title }]} />

      <div className="mt-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-8 sm:p-12 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        </div>

        {/* Content */}
        {content ? (
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:leading-relaxed prose-li:leading-relaxed prose-strong:text-foreground" style={{ color: textColor }}>
            <div dangerouslySetInnerHTML={{ __html: processContent(content) }} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-16 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Terms & Conditions content will appear here once published in the admin panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
