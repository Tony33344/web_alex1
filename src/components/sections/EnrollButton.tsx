'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

interface EnrollButtonProps {
  locale: string;
  programSlug: string;
  label: string;
  stripepriceId?: string | null;
}

export function EnrollButton({ locale, programSlug, label, stripepriceId }: EnrollButtonProps) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEnroll() {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/coach-training/${programSlug}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/programs/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Enrollment failed');
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // No Stripe price — redirect to contact
      router.push(`/${locale}/contact`);
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" size="lg" onClick={handleEnroll} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {label}
      </Button>
      {error && <p className="text-xs text-center text-destructive">{error}</p>}
    </div>
  );
}
