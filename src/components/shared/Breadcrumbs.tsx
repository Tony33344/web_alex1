'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  locale: string;
  items?: { label: string; href?: string }[];
}

export function Breadcrumbs({ locale, items }: BreadcrumbsProps) {
  const pathname = usePathname();

  const crumbs = items ?? generateCrumbs(pathname, locale);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href={`/${locale}`} className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5" />
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function generateCrumbs(pathname: string, locale: string) {
  const segments = pathname.replace(`/${locale}`, '').split('/').filter(Boolean);
  return segments.map((seg, i) => ({
    label: seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    href: i < segments.length - 1 ? `/${locale}/${segments.slice(0, i + 1).join('/')}` : undefined,
  }));
}
