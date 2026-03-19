import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function HealthCategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const title = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: 'Health', href: `/${locale}/health` }, { label: title }]} />

      <div className="mt-8 space-y-8">
        <div className="aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <div className="prose max-w-none text-muted-foreground">
          <p>Health category content will be loaded from Supabase when the database is connected. This page displays the full content for the {title} health category, including detailed descriptions, benefits, practices, and related programs.</p>
          <p>The content supports multiple languages and will automatically display in the user&apos;s selected locale.</p>
        </div>
      </div>

      <div className="mt-12">
        <Link href={`/${locale}/health`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Health
        </Link>
      </div>
    </div>
  );
}
