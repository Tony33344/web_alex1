import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { getTeacher } from '@/lib/queries/teachers';
import { getLocalizedField } from '@/lib/localization';

export default async function TeacherDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const teacher = await getTeacher(slug);

  if (!teacher) notFound();

  const title = getLocalizedField(teacher, 'title', locale) || 'Role Teacher';
  const bio = getLocalizedField(teacher, 'bio', locale) || '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs locale={locale} items={[{ label: 'Role Teachers', href: `/${locale}/role-teachers` }, { label: teacher.name }]} />

      <div className="mt-8 grid gap-12 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
              {teacher.photo_url && (
                <img src={teacher.photo_url} alt={teacher.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{teacher.name}</h1>
              <p className="mt-1 text-primary">{title}</p>
            </div>
            {teacher.specialties?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {teacher.specialties.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="prose max-w-none text-muted-foreground">
            <h2 className="text-foreground">About {teacher.name}</h2>
            {bio ? (
              <div dangerouslySetInnerHTML={{ __html: bio }} />
            ) : (
              <p>Full biography coming soon.</p>
            )}
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
