'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, User as UserIcon, Settings, Calendar, CreditCard, MapPin } from 'lucide-react';
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
  const [registrations, setRegistrations] = useState<Array<{ id: string; status: string; payment_status: string; created_at: string; events: { title_en: string; start_date: string; location: string | null; is_online: boolean } | null }>>([]);
  const [regsLoading, setRegsLoading] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    setRegsLoading(true);
    const supabase = createClient();
    supabase
      .from('event_registrations')
      .select('id, status, payment_status, created_at, events(title_en, start_date, location, is_online)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setRegistrations((data as unknown as typeof registrations) ?? []);
        setRegsLoading(false);
      });
  }, [user]);

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
              {regsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : registrations.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No event registrations yet.</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push(`/${locale}/events`)}>Browse Events</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <p className="font-medium">{reg.events?.title_en ?? 'Event'}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {reg.events?.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(reg.events.start_date).toLocaleDateString()}
                            </span>
                          )}
                          {reg.events && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {reg.events.is_online ? 'Online' : reg.events.location ?? 'TBA'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={reg.status === 'registered' || reg.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">{reg.status}</Badge>
                        <Badge variant={reg.payment_status === 'paid' || reg.payment_status === 'free' ? 'outline' : 'secondary'} className="text-xs">{reg.payment_status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
