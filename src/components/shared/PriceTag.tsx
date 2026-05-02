import { Sparkles } from 'lucide-react';
import type { ActivePricing } from '@/lib/utils/pricing';

interface PriceTagProps {
  pricing: ActivePricing;
  freeLabel: string;
  locale: string;
  className?: string;
  size?: 'md' | 'lg';
}

/**
 * Display an active price with optional early-bird strikethrough + deadline note.
 * Renders inline; caller controls flex/alignment.
 */
export function PriceTag({ pricing, freeLabel, locale, className = '', size = 'md' }: PriceTagProps) {
  const { activePrice, regularPrice, isEarlyBird, earlyBirdDeadline, currency } = pricing;

  if (!activePrice || activePrice <= 0) {
    return <span className={`font-semibold text-primary ${className}`}>{freeLabel}</span>;
  }

  const textSize = size === 'lg' ? 'text-2xl' : 'text-base';
  const smallSize = size === 'lg' ? 'text-sm' : 'text-xs';

  if (!isEarlyBird) {
    return <span className={`${textSize} font-bold text-primary whitespace-nowrap ${className}`}>{currency} {activePrice}</span>;
  }

  const deadlineLabel = earlyBirdDeadline?.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

  return (
    <div className={`flex flex-col items-end gap-0.5 w-full ${className}`}>
      <div className="flex items-baseline gap-2">
        {regularPrice != null && regularPrice > activePrice && (
          <span className={`${smallSize} text-muted-foreground line-through`}>{currency} {regularPrice}</span>
        )}
        <span className={`${textSize} font-bold text-primary whitespace-nowrap`}>{currency} {activePrice}</span>
      </div>
      <span className={`${smallSize} inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200`}>
        <Sparkles className="h-3 w-3" />
        Early bird until {deadlineLabel}
      </span>
    </div>
  );
}
