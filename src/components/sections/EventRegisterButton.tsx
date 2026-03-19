'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog';

interface EventRegisterButtonProps {
  eventId: string;
  locale: string;
  label: string;
  isFree: boolean;
  isFull: boolean;
  price?: number | null;
  currency?: string;
  eventTitle?: string;
}

export function EventRegisterButton({ eventId, locale, label, isFree, isFull, price, currency, eventTitle }: EventRegisterButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/events`);
      return;
    }

    // Paid event → show checkout dialog
    if (!isFree && price && price > 0) {
      setShowCheckout(true);
      return;
    }

    // Free event → register directly
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      setRegistered(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  async function handleCheckout(paymentMethod: 'stripe' | 'bank_transfer') {
    const res = await fetch('/api/events/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, paymentMethod }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Registration failed' };
    if (data.checkoutUrl) return { checkoutUrl: data.checkoutUrl };
    if (data.reference) return { reference: data.reference };
    setRegistered(true);
    setShowCheckout(false);
    return {};
  }

  if (registered) {
    return (
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Registered!</span>
        </div>
        <p className="text-xs text-muted-foreground">Check your email for confirmation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" disabled={loading || isFull} onClick={handleClick}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isFull ? 'Event Full — Join Waitlist' : label}
      </Button>
      {error && <p className="text-xs text-center text-destructive">{error}</p>}
      {!isFree && price && price > 0 && (
        <CheckoutDialog
          open={showCheckout}
          onOpenChange={setShowCheckout}
          title={eventTitle || 'Event Registration'}
          price={price}
          currency={currency || 'EUR'}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
