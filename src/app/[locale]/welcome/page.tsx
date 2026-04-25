'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  ArrowRight, Calendar, Users, Crown, UserCog, CreditCard,
  Sparkles, Settings, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/Logo';
import { useUser } from '@/hooks/useUser';

type HubCard = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: string; // tailwind color classes
  badge?: string;
};

export default function WelcomePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const { user, profile, isAdmin } = useUser();

  const isActiveMember = profile?.subscription_status === 'active';
  const name = profile?.full_name || user?.email?.split('@')[0] || 'friend';

  // Verify session if session_id in URL (after Stripe payment)
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && user) {
      fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).then(res => res.json()).then(data => {
        console.log('Session verification result:', data);
        // Reload user data to reflect subscription status
        window.location.reload();
      }).catch(err => {
        console.error('Session verification failed:', err);
      });
    }
  }, [searchParams, user]);

  // Personal (account-related) cards
  const personalCards: HubCard[] = [
    {
      href: `/${locale}/profile`,
      icon: UserCog,
      title: 'Edit Profile',
      description: 'Update your name, phone, language',
      accent: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    },
    {
      href: `/${locale}/profile?tab=subscription`,
      icon: CreditCard,
      title: 'Subscription',
      description: isActiveMember ? 'Manage your membership' : 'View plans & join',
      accent: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
      badge: isActiveMember ? 'Active' : undefined,
    },
    {
      href: `/${locale}/profile?tab=events`,
      icon: Calendar,
      title: 'My Events',
      description: 'Your registrations & bookings',
      accent: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
    },
    {
      href: `/${locale}/profile?tab=settings`,
      icon: Settings,
      title: 'Account Settings',
      description: 'Password & security',
      accent: 'text-slate-500 bg-slate-100 dark:bg-slate-900/50',
    },
  ];

  // Member-only cards
  const memberCards: HubCard[] = isActiveMember
    ? [
        {
          href: `/${locale}/members`,
          icon: Crown,
          title: 'Members Area',
          description: 'Exclusive content & resources',
          accent: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
          badge: 'Members',
        },
        {
          href: `/${locale}/members/survey`,
          icon: Sparkles,
          title: 'Personalized Plan',
          description: 'Answer the questionnaire to get your 1-month plan',
          accent: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
        },
      ]
    : [];

  // Explore cards (public)
  const exploreCards: HubCard[] = [
    {
      href: `/${locale}/events`,
      icon: Calendar,
      title: 'Events',
      description: 'Browse and register for upcoming events',
      accent: 'text-primary bg-primary/10',
    },
    {
      href: `/${locale}/coach-training`,
      icon: Users,
      title: 'Programs',
      description: 'Coach training & role teachers programs',
      accent: 'text-primary bg-primary/10',
    },
    {
      href: `/${locale}/membership`,
      icon: Crown,
      title: 'Membership',
      description: isActiveMember ? "You're already a member" : 'Join for exclusive benefits',
      accent: 'text-primary bg-primary/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <Logo locale={locale} size={56} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Welcome, {name}!
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {isActiveMember
                ? "You're an active member. Everything you need, in one place."
                : 'Your personal hub — manage your account, events and explore what we offer.'}
            </p>
            {isActiveMember && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950/40 dark:to-yellow-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium">
                <Crown className="h-3.5 w-3.5" />
                {profile?.subscription_plan === 'yearly' ? 'Yearly Member' : 'Monthly Member'}
              </div>
            )}
          </div>

          {/* Account / Personal Hub */}
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">
              Your account
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {personalCards.map((c) => (
                <HubCardTile key={c.title} card={c} />
              ))}
            </div>
          </section>

          {/* Member-only section */}
          {memberCards.length > 0 && (
            <section className="mb-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                For members
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {memberCards.map((c) => (
                  <HubCardTile key={c.title} card={c} highlight />
                ))}
              </div>
            </section>
          )}

          {/* Explore */}
          <section className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-1">
              Explore
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {exploreCards.map((c) => (
                <HubCardTile key={c.title} card={c} />
              ))}
            </div>
          </section>

          {/* Non-member banner */}
          {!isActiveMember && (
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Unlock members-only benefits</h3>
                    <p className="text-sm text-muted-foreground">
                      Access exclusive content, workshops, and a personalized 1-month plan built for you.
                    </p>
                  </div>
                  <Link href={`/${locale}/membership`}>
                    <Button className="shrink-0">
                      View Plans <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin shortcut */}
          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shield className="h-4 w-4" />
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HubCardTile({ card, highlight = false }: { card: HubCard; highlight?: boolean }) {
  const Icon = card.icon;
  return (
    <Link href={card.href} className="group block">
      <Card
        className={`h-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
          highlight ? 'border-amber-200 dark:border-amber-800' : ''
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${card.accent}`}>
              <Icon className="h-5 w-5" />
            </div>
            {card.badge && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                {card.badge}
              </span>
            )}
          </div>
          <CardTitle className="text-base mt-3 group-hover:text-primary transition-colors">
            {card.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{card.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
