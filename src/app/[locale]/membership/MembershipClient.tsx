'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog';
import { useUser } from '@/hooks/useUser';
import type { MembershipPlan } from '@/types/database';
import { getLocalizedField } from '@/lib/localization';

interface MembershipClientProps {
  plans: MembershipPlan[];
  pageTitle: string;
  pageContent: string;
  locale: string;
}

export function MembershipClient({ plans, pageTitle, pageContent, locale }: MembershipClientProps) {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useUser();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const monthlyPlan = plans.find(p => p.plan_type === 'monthly');
  const yearlyPlan = plans.find(p => p.plan_type === 'yearly');
  const activePlan = selectedPlanId 
    ? plans.find(p => p.id === selectedPlanId) 
    : (yearlyPlan || monthlyPlan || plans[0]);

  async function handleCheckout() {
    if (!user) {
      router.push(`/${locale}/login?redirect=/${locale}/membership`);
      return;
    }
    setShowCheckout(true);
  }

  async function processPayment(paymentMethod: 'stripe' | 'bank_transfer') {
    if (!activePlan) return { error: 'No plan selected' };
    
    if (paymentMethod === 'bank_transfer') {
      const res = await fetch('/api/membership/bank-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: activePlan.plan_type }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to create bank transfer request' };
      return { reference: data.reference };
    }
    
    // Stripe payment
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: activePlan.plan_type }),
    });
    const data = await res.json();
    if (data.url) return { checkoutUrl: data.url };
    return { error: 'Could not create checkout session' };
  }

  const hasMultiplePlans = plans.length > 1;
  
  // Get localized plan name
  const getPlanName = (plan: MembershipPlan) => {
    return getLocalizedField(plan, 'name', locale) || plan.name_en;
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Billing Toggle */}
      {hasMultiplePlans && (
        <div className="mb-12 flex items-center justify-center gap-4">
          {monthlyPlan && (
            <button
              onClick={() => setSelectedPlanId(monthlyPlan.id)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${selectedPlanId === monthlyPlan.id || (!selectedPlanId && activePlan?.plan_type === 'monthly') ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {t('membership.monthly')}
            </button>
          )}
          {yearlyPlan && (
            <button
              onClick={() => setSelectedPlanId(yearlyPlan.id)}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition-colors ${selectedPlanId === yearlyPlan.id || (!selectedPlanId && activePlan?.plan_type === 'yearly') ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {t('membership.yearly')}
              {yearlyPlan.is_popular && (
                <Badge className="absolute -right-2 -top-3 bg-secondary text-secondary-foreground text-xs">
                  Popular
                </Badge>
              )}
            </button>
          )}
        </div>
      )}

      {/* Plan Card */}
      {activePlan && (
        <div className="mx-auto max-w-md">
          <Card className="relative overflow-hidden border-primary/30 shadow-lg">
            {activePlan.is_popular && (
              <div className="absolute right-4 top-4">
                <Star className="h-5 w-5 fill-secondary text-secondary" />
              </div>
            )}
            <CardHeader className="pb-4 text-center">
              <CardTitle className="text-xl">{getPlanName(activePlan)}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">{activePlan.currency} {activePlan.price}</span>
                <span className="text-muted-foreground">/{activePlan.plan_type === 'monthly' ? t('common.perMonth') : t('common.perYear')}</span>
              </div>
              {activePlan.plan_type === 'yearly' && monthlyPlan && (
                <p className="mt-2 text-sm text-primary">
                  Save vs monthly plan
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {activePlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
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
      )}

      {/* Bank Transfer */}
      <div className="mt-12 rounded-xl border bg-muted/50 p-6 text-center">
        <h3 className="text-lg font-semibold">{t('membership.bankTransfer')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Contact us to arrange a direct bank transfer. We&apos;ll activate your membership manually.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/${locale}/contact`)}>
          {t('common.contactUs')}
        </Button>
      </div>

      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        title={`${getPlanName(activePlan!)} (${activePlan?.plan_type})`}
        price={activePlan?.price || 0}
        currency={activePlan?.currency || 'CHF'}
        onCheckout={processPayment}
      />
    </section>
  );
}
