'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

interface EventRegisterButtonProps {
  eventId: string;
  locale: string;
  label: string;
  isFree: boolean;
  isFull: boolean;
}

export function EventRegisterButton({ eventId, locale, label, isFree, isFull }: EventRegisterButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/events`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Paid event → redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setRegistered(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
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
      <Button
        className="w-full"
        size="lg"
        disabled={loading || isFull}
        onClick={handleRegister}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isFull ? 'Event Full — Join Waitlist' : label}
      </Button>
      {error && <p className="text-xs text-center text-destructive">{error}</p>}
    </div>
  );
}
