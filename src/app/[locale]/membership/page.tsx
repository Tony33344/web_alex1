'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUser } from '@/hooks/useUser';

export default function MembershipPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user, profile } = useUser();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  const plans = {
    monthly: { price: 29, period: t('common.perMonth'), stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID },
    yearly: { price: 249, period: t('common.perYear'), stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID, savings: 30 },
  };

  const features = [
    'Access to all members-only blog posts',
    'Early access to event registration',
    'Discounts on all coach training programs',
    'Exclusive monthly online workshops',
    'Access to the meditation library',
    'Community forum access',
    'Monthly 1-on-1 guidance session',
    'Priority support',
  ];

  async function handleCheckout() {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/membership`);
      return;
    }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: billing }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <>
      <PageHeader title={t('membership.title')} subtitle={t('membership.subtitle')} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Billing Toggle */}
        <div className="mb-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {t('membership.monthly')}
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`relative rounded-full px-6 py-2 text-sm font-medium transition-colors ${billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {t('membership.yearly')}
            {billing === 'yearly' && (
              <Badge className="absolute -right-2 -top-3 bg-secondary text-secondary-foreground text-xs">
                Save {plans.yearly.savings}%
              </Badge>
            )}
          </button>
        </div>

        {/* Plan Card */}
        <div className="mx-auto max-w-md">
          <Card className="relative overflow-hidden border-primary/30 shadow-lg">
            <div className="absolute right-4 top-4">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
            </div>
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-xl">Infinity Membership</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">CHF {plans[billing].price}</span>
                <span className="text-muted-foreground">{plans[billing].period}</span>
              </div>
              {billing === 'yearly' && (
                <p className="mt-2 text-sm text-primary">
                  CHF {Math.round(plans.yearly.price / 12)}/month — Save {plans.yearly.savings}%
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {profile?.subscription_status === 'active' ? (
                <form action="/api/stripe/portal" method="POST">
                  <Button type="submit" variant="outline" className="w-full">
                    {t('membership.manageSubscription')}
                  </Button>
                </form>
              ) : (
                <Button onClick={handleCheckout} className="w-full gap-2" size="lg">
                  {t('common.subscribeNow')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bank Transfer */}
        <div className="mt-12 rounded-xl border bg-muted/50 p-6 text-center">
          <h3 className="text-lg font-semibold">{t('membership.bankTransfer')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact us to arrange a direct bank transfer to AMS4EVER AG. We&apos;ll activate your membership manually.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(`/${locale}/contact`)}>
            {t('common.contactUs')}
          </Button>
        </div>
      </section>
    </>
  );
}
