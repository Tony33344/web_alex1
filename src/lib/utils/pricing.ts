export interface Priceable {
  price: number | null;
  currency: string;
  stripe_price_id: string | null;
  early_bird_price: number | null;
  early_bird_deadline: string | null;
  early_bird_stripe_price_id: string | null;
}

export interface ActivePricing {
  /** The price the customer pays right now (early-bird if active, else regular). */
  activePrice: number | null;
  /** The Stripe price id to charge — early-bird one if active and set, else regular. */
  activeStripePriceId: string | null;
  /** Regular (non-discounted) price — for strikethrough display. */
  regularPrice: number | null;
  /** Whether an early-bird discount is currently active. */
  isEarlyBird: boolean;
  /** The deadline Date (if a discount is configured, regardless of active). */
  earlyBirdDeadline: Date | null;
  currency: string;
}

/**
 * Compute current pricing for a Priceable entity.
 * Early-bird is active when: early_bird_price is set AND deadline is in the future.
 */
export function getActivePricing(item: Priceable, now: Date = new Date()): ActivePricing {
  const deadline = item.early_bird_deadline ? new Date(item.early_bird_deadline) : null;
  const hasEarlyBird =
    item.early_bird_price != null && deadline != null && deadline.getTime() > now.getTime();

  return {
    activePrice: hasEarlyBird ? item.early_bird_price : item.price,
    activeStripePriceId: hasEarlyBird
      ? item.early_bird_stripe_price_id || item.stripe_price_id
      : item.stripe_price_id,
    regularPrice: item.price,
    isEarlyBird: hasEarlyBird,
    earlyBirdDeadline: deadline,
    currency: item.currency,
  };
}
