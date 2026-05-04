'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EnrollButton } from './EnrollButton';

interface EnrollButtonClientProps {
  locale: string;
  programId: string;
  label: string;
  stripepriceId?: string | null;
  price?: number | null;
  currency?: string;
  programName?: string;
}

export function EnrollButtonClient({ locale, programId, label, stripepriceId, price, currency, programName }: EnrollButtonClientProps) {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const [autoOpenCheckout, setAutoOpenCheckout] = useState(false);

  useEffect(() => {
    if (intent === 'register' && price && price > 0) {
      setAutoOpenCheckout(true);
      // Clear intent from URL to prevent re-opening on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('intent');
      window.history.replaceState({}, '', url.toString());
    }
  }, [intent, price]);

  return <EnrollButton locale={locale} programId={programId} label={label} stripepriceId={stripepriceId} price={price} currency={currency} programName={programName} autoOpenCheckout={autoOpenCheckout} />;
}
