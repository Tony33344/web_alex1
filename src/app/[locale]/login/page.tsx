'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginFormData } from '@/lib/validators';

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const confirmed = searchParams.get('confirmed');
  const urlError = searchParams.get('error');
  const message = searchParams.get('message');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Show error from URL query params
  useEffect(() => {
    if (urlError === 'email_confirmation_failed') {
      setError(message || 'Email confirmation failed. Please try again or contact support.');
    }
  }, [urlError, message]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      // Better error message for unconfirmed email
      if (authError.message?.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email address before logging in. Check your inbox for the confirmation link.');
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    // Check if user is admin → redirect to admin dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const res = await fetch('/api/auth/role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id }) });
      const { role } = await res.json().catch(() => ({}));
      if (role === 'admin' || role === 'super_admin') {
        router.push('/admin');
        router.refresh();
        return;
      }
    }

    router.push(redirect || `/${locale}/welcome`);
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo locale={locale} size={56} />
          </div>
          <div>
            <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t('loginSubtitle')}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {confirmed && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Email confirmed!</span>
                </div>
                <p className="mt-1 ml-6">Your email has been verified. Please sign in to continue.</p>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" className="pl-10" placeholder="you@example.com" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link href={`/${locale}/forgot-password`} className="text-xs text-primary hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" className="pl-10" placeholder="••••••••" {...register('password')} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('signIn')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/register`} className="font-medium text-primary hover:underline">
                {t('signUp')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
