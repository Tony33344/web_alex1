'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-destructive">{t('error.title')}</h1>
      <p className="mt-4 text-xl font-semibold text-foreground">{t('error.description')}</p>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t('error.description')}
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {t('error.tryAgain')}
        </button>
        <Link
          href="/en"
          className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          {t('error.goHome')}
        </Link>
      </div>
    </div>
  );
}
