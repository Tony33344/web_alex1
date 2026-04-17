'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Calendar, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/Logo';
import { useUser } from '@/hooks/useUser';

export default function WelcomePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { user, profile } = useUser();

  const isActiveMember = profile?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Logo locale={locale} size={64} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Welcome, {profile?.full_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-lg text-muted-foreground">
              {isActiveMember 
                ? "You're an active member. Explore exclusive content below."
                : "Discover our events, programs, and membership options."
              }
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse and register for upcoming events
                </p>
                <Link href={`/${locale}/events`}>
                  <Button variant="outline" className="w-full">
                    View Events <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Programs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our coach training and role teachers programs
                </p>
                <Link href={`/${locale}/coach-training`}>
                  <Button variant="outline" className="w-full">
                    View Programs <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Crown className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Membership</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {isActiveMember ? "You're already a member!" : "Become a member for exclusive benefits"}
                </p>
                {isActiveMember ? (
                  <Link href={`/${locale}/members`}>
                    <Button className="w-full">
                      Members Area <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/${locale}/membership`}>
                    <Button variant="outline" className="w-full">
                      Join Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Member Banner */}
          {isActiveMember && (
            <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      🎉 You're an Active Member
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Access exclusive content in the members-only section
                    </p>
                  </div>
                  <Link href={`/${locale}/members`}>
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      Go to Members Area
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
