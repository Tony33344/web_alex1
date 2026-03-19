import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export default async function TeacherDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: 'Role Teachers', href: `/${locale}/role-teachers` }, { label: name }]} />

      <div className="mt-8 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="mt-1 text-primary">Role Teacher</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Sunyoga</Badge>
              <Badge variant="secondary">Meditation</Badge>
              <Badge variant="secondary">Holistic Healing</Badge>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="prose max-w-none text-muted-foreground">
            <h2 className="text-foreground">About {name}</h2>
            <p>Teacher bio and full content will be loaded from Supabase when the database is connected. This page displays the complete teacher profile with their biography, specialties, qualifications, and social links.</p>
            <p>The content supports multiple languages and will automatically display in the user&apos;s selected locale.</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Link href={`/${locale}/role-teachers`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Role Teachers
        </Link>
      </div>
    </div>
  );
}
