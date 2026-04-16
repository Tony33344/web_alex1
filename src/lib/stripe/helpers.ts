import { stripe } from './client';

export async function createCheckoutSession({
  customerId,
  priceId,
  mode,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string;
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    ...(mode === 'subscription' && {
      subscription_data: { metadata },
    }),
  });

  return session;
}

/**
 * Creates a one-time Stripe Checkout session using a dynamic price (no pre-created Price ID needed).
 * Card data is never stored — Stripe handles everything.
 */
export async function createDynamicCheckoutSession({
  customerId,
  productName,
  amountInCents,
  currency,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string;
  productName: string;
  amountInCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amountInCents,
          product_data: { name: productName },
        },
        quantity: 1,
      },
    ],
    payment_method_types: ['card'],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });

  return session;
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

export async function createOrRetrieveCustomer({
  email,
  name,
  supabaseId,
}: {
  email: string;
  name: string;
  supabaseId: string;
}) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_id: supabaseId },
  });

  return customer;
}
