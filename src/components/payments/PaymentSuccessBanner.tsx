'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Variant = 'subscription' | 'payment';

interface Props {
  /** Which query param signals success: 'subscription' for membership, 'payment' for events/programs */
  param?: Variant;
  title?: string;
  message?: string;
  /** Optional CTA shown in the banner */
  ctaLabel?: string;
  ctaHref?: string;
}

export function PaymentSuccessBanner({
  param = 'payment',
  title,
  message,
  ctaLabel,
  ctaHref,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const isSuccess = searchParams.get(param) === 'success';

  useEffect(() => {
    if (!isSuccess) return;
    setVisible(true);

    const sessionId = searchParams.get('session_id');

    async function verifyAndCleanup() {
      // Activate subscription/registration via Stripe (fallback when webhooks aren't configured)
      if (sessionId) {
        try {
          await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
        } catch {
          // Non-fatal — webhook may still process it
        }
      }

      // Clean URL so reloads don't re-trigger
      const params = new URLSearchParams(searchParams.toString());
      params.delete(param);
      params.delete('session_id');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }

    verifyAndCleanup();
  }, [isSuccess, param, pathname, router, searchParams]);

  if (!visible) return null;

  const defaultTitle = param === 'subscription' ? 'Welcome to the club' : 'Payment confirmed';
  const defaultMessage =
    param === 'subscription'
      ? 'Your membership is active. A receipt is on its way to your inbox.'
      : 'Thank you — your booking is confirmed. A receipt has been emailed to you.';

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 shadow-2xl shadow-emerald-500/10 backdrop-blur dark:from-emerald-950/40 dark:via-background dark:to-background">
        <div className="relative flex items-start gap-4 p-5 pr-10">
          <div className="relative shrink-0">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
            <div className="relative grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">{title ?? defaultTitle}</h3>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message ?? defaultMessage}
            </p>
            {ctaLabel && ctaHref && (
              <div className="pt-2">
                <Button size="sm" onClick={() => router.push(ctaHref)}>
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
