'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { EventRegisterButton } from './EventRegisterButton';

interface EventRegisterButtonClientProps {
  eventId: string;
  locale: string;
  label: string;
  isFree: boolean;
  isFull: boolean;
  price?: number | null;
  currency?: string;
  eventTitle?: string;
}

export function EventRegisterButtonClient({ eventId, locale, label, isFree, isFull, price, currency, eventTitle }: EventRegisterButtonClientProps) {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const [autoOpenCheckout, setAutoOpenCheckout] = useState(false);

  useEffect(() => {
    if (intent === 'register' && !isFree && price && price > 0) {
      setAutoOpenCheckout(true);
      // Clear intent from URL to prevent re-opening on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('intent');
      window.history.replaceState({}, '', url.toString());
    }
  }, [intent, isFree, price]);

  return <EventRegisterButton eventId={eventId} locale={locale} label={label} isFree={isFree} isFull={isFull} price={price} currency={currency} eventTitle={eventTitle} autoOpenCheckout={autoOpenCheckout} />;
}
