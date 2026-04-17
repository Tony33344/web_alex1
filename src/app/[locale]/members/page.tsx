import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Crown, Lock, BookOpen, Video, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentSuccessBanner } from '@/components/payments/PaymentSuccessBanner';

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_plan, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.subscription_status !== 'active') {
    redirect('/membership');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-background to-background dark:from-amber-950/20 dark:via-background dark:to-background">
      <PaymentSuccessBanner param="subscription" />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Members Only
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome, {profile.full_name || 'Member'}! Here's your exclusive content.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium">
              <Lock className="h-4 w-4" />
              {profile.subscription_plan === 'yearly' ? 'Yearly Member' : 'Monthly Member'}
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow border-amber-200 dark:border-amber-800">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-amber-500 mb-2" />
                <CardTitle>Exclusive Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access downloadable guides, templates, and member-only materials.
                </p>
                <Button variant="outline" className="w-full">
                  Browse Resources
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-amber-200 dark:border-amber-800">
              <CardHeader>
                <Video className="h-10 w-10 text-amber-500 mb-2" />
                <CardTitle>Video Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Watch recorded workshops, training sessions, and exclusive video content.
                </p>
                <Button variant="outline" className="w-full">
                  Watch Videos
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-amber-200 dark:border-amber-800">
              <CardHeader>
                <Calendar className="h-10 w-10 text-amber-500 mb-2" />
                <CardTitle>Member Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Join exclusive member-only events, Q&A sessions, and networking meetups.
                </p>
                <Button variant="outline" className="w-full">
                  View Events
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-amber-200 dark:border-amber-800 md:col-span-2 lg:col-span-3">
              <CardHeader>
                <Download className="h-10 w-10 text-amber-500 mb-2" />
                <CardTitle>Quick Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Get instant access to our most popular member resources.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button variant="secondary" className="w-full">
                    📄 Member Handbook
                  </Button>
                  <Button variant="secondary" className="w-full">
                    📋 Event Templates
                  </Button>
                  <Button variant="secondary" className="w-full">
                    🎯 Training Materials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coming Soon */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              More exclusive content coming soon! Check back regularly for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
