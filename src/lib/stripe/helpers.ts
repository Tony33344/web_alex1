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
