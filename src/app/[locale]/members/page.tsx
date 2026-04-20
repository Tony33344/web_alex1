import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPage } from '@/lib/queries/pages';
import { getLocalizedField } from '@/lib/localization';
import { nl2br } from '@/lib/utils/text';
import { verifyAndActivateSession } from '@/lib/stripe/verify-session';
import { Crown, Lock, BookOpen, Video, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentSuccessBanner } from '@/components/payments/PaymentSuccessBanner';

export default async function MembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; subscription?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // If arriving from Stripe checkout, activate the subscription server-side
  // BEFORE the active-member check, otherwise we'd redirect away too early.
  if (session_id) {
    await verifyAndActivateSession(session_id, user.id);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status, subscription_plan, full_name, survey_completed_at')
    .eq('id', user.id)
    .single();

  if (!profile || profile.subscription_status !== 'active') {
    redirect(`/${locale}/membership`);
  }

  const page = await getPage('members');
  const content = page ? (getLocalizedField(page, 'content', locale) || page.content_en) : null;
  const surveyCompleted = !!profile.survey_completed_at;

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

          {/* Personalized plan CTA */}
          <div className="mb-10 rounded-2xl border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-background shadow-sm shrink-0">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {surveyCompleted ? 'Update your personalized plan profile' : 'Get your personalized 1-month plan'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {surveyCompleted
                      ? 'Your answers are saved. One of our Infinity Role Teachers will be in touch. Update anytime.'
                      : 'Answer a few quick questions. One of our Infinity Role Teachers will then contact you (phone, Zoom, Signal or WhatsApp) to co-create a 1-month plan for body, mind and spirit.'}
                  </p>
                </div>
              </div>
              <Link href="/members/survey">
                <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shrink-0">
                  {surveyCompleted ? 'Edit answers' : 'Start questionnaire'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Content */}
          {content ? (
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
              <div dangerouslySetInnerHTML={{ __html: nl2br(content) }} />
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
