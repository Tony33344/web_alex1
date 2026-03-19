'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, User as UserIcon, Settings, Calendar, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { profileSchema, type ProfileFormData } from '@/lib/validators';
import { LOCALE_LABELS, LOCALES } from '@/lib/constants';

export default function ProfilePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { user, profile, loading: userLoading } = useUser();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        preferred_language: profile.preferred_language,
      });
    }
  }, [profile, reset]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/${locale}/login`);
    }
  }, [user, userLoading, router, locale]);

  async function onSubmit(data: ProfileFormData) {
    setSaving(true);
    setMessage('');

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        preferred_language: data.preferred_language,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Profile updated successfully!');
    }
    setSaving(false);
  }

  if (userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <p className="mt-1 text-muted-foreground">Manage your account settings and subscriptions</p>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList>
          <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4" />Profile</TabsTrigger>
          <TabsTrigger value="subscription"><CreditCard className="mr-2 h-4 w-4" />Subscription</TabsTrigger>
          <TabsTrigger value="events"><Calendar className="mr-2 h-4 w-4" />My Events</TabsTrigger>
          <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {message && (
                  <div className={`rounded-md p-3 text-sm ${message.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {message}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...register('full_name')} />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_language">Preferred Language</Label>
                  <select
                    id="preferred_language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    {...register('preferred_language')}
                  >
                    {LOCALES.map((loc) => (
                      <option key={loc} value={loc}>
                        {LOCALE_LABELS[loc].flag} {LOCALE_LABELS[loc].label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={profile.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {profile.subscription_status}
                </Badge>
              </div>
              {profile.subscription_plan && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Plan:</span>
                  <span className="text-sm capitalize">{profile.subscription_plan}</span>
                </div>
              )}
              {profile.subscription_end_date && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Renews:</span>
                  <span className="text-sm">{new Date(profile.subscription_end_date).toLocaleDateString()}</span>
                </div>
              )}
              <Separator />
              {profile.subscription_status === 'active' ? (
                <form action="/api/stripe/portal" method="POST">
                  <Button type="submit" variant="outline">
                    Manage Subscription
                  </Button>
                </form>
              ) : (
                <Button onClick={() => router.push(`/${locale}/membership`)}>
                  View Plans
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Event Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your upcoming and past event registrations will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" onClick={() => router.push(`/${locale}/reset-password`)}>
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
