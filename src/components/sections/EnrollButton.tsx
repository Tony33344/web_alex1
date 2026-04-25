'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog';

interface EnrollButtonProps {
  locale: string;
  programSlug: string;
  label: string;
  stripepriceId?: string | null;
  price?: number | null;
  currency?: string;
  programName?: string;
}

export function EnrollButton({ locale, programSlug, label, price, currency, programName }: EnrollButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [hasReference, setHasReference] = useState(false);

  const isFree = !price || price <= 0;

  async function handleClick() {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/coach-training/${programSlug}`);
      return;
    }

    // Paid program → show checkout dialog
    if (!isFree) {
      setShowCheckout(true);
      return;
    }

    // Free program → enroll directly
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Enrollment failed'); setLoading(false); return; }
      setEnrolled(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  async function handleCheckout(paymentMethod: 'stripe' | 'bank_transfer') {
    try {
      const res = await fetch('/api/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programSlug, paymentMethod, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Enrollment failed';
        setError(errorMsg);
        return { error: errorMsg };
      }
      if (data.checkoutUrl) return { checkoutUrl: data.checkoutUrl };
      if (data.reference) {
        setHasReference(true);
        return { reference: data.reference };
      }
      setEnrolled(true);
      setShowCheckout(false);
      return {};
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setError(errorMsg);
      return { error: errorMsg };
    }
  }

  if (enrolled) {
    return (
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Enrolled!</span>
        </div>
        <p className="text-xs text-muted-foreground">You&apos;re in. Check your email for details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleClick} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {label}
      </Button>
      {error && <p className="text-xs text-center text-destructive">{error}</p>}
      {!isFree && (
        <CheckoutDialog
          open={showCheckout}
          onOpenChange={(open) => {
            setShowCheckout(open);
            if (!open && hasReference) setEnrolled(true);
          }}
          title={programName || 'Program Enrollment'}
          price={price!}
          currency={currency || 'EUR'}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}
