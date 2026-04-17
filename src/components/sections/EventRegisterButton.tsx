'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog';
import { WaitlistDialog } from './WaitlistDialog';

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
  const { user, profile } = useUser();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [hasReference, setHasReference] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  async function handleClick() {
    if (!user) {
      const currentUrl = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : `/${locale}/events`;
      router.push(`/${locale}/login?redirect=${encodeURIComponent(currentUrl)}`);
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
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Registration failed';
        setError(errorMsg);
        return { error: errorMsg };
      }
      if (data.checkoutUrl) return { checkoutUrl: data.checkoutUrl };
      if (data.reference) {
        setHasReference(true);
        return { reference: data.reference };
      }
      setRegistered(true);
      setShowCheckout(false);
      return {};
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setError(errorMsg);
      return { error: errorMsg };
    }
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

  if (isFull) {
    return (
      <div className="space-y-2">
        <Button
          className="w-full gap-2"
          size="lg"
          variant="outline"
          onClick={() => setShowWaitlist(true)}
        >
          <Users className="h-4 w-4" />
          Join Waiting List
        </Button>
        <p className="text-xs text-center text-muted-foreground">This event is full. Join the list to be notified if a spot opens.</p>
        <WaitlistDialog
          eventId={eventId}
          eventTitle={eventTitle || 'Event'}
          open={showWaitlist}
          onOpenChange={setShowWaitlist}
          defaultEmail={user?.email || ''}
          defaultName={profile?.full_name || ''}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" disabled={loading} onClick={handleClick}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {label}
      </Button>
      {error && <p className="text-xs text-center text-destructive">{error}</p>}
      {!isFree && price && price > 0 && (
        <CheckoutDialog
          open={showCheckout}
          onOpenChange={(open) => {
            setShowCheckout(open);
            if (!open && hasReference) setRegistered(true);
          }}
          title={eventTitle || 'Event Registration'}
          price={price}
          currency={currency || 'EUR'}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
