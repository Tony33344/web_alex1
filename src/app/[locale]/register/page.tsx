'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Lock, Eye, EyeOff, User as UserIcon, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { LOCALE_LABELS, LOCALES } from '@/lib/constants';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const intent = searchParams.get('intent');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      preferred_language: locale as RegisterFormData['preferred_language'],
      subscribe_newsletter: true,
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    setError('');

    // Build callback URL with redirect and intent parameters preserved
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://infinityroleteachers.com';
    let callbackUrl = `${appUrl}/${locale}/auth/callback`;
    const queryParams: string[] = [];
    if (redirect) queryParams.push(`redirect=${encodeURIComponent(redirect)}`);
    if (intent) queryParams.push(`intent=${intent}`);
    if (queryParams.length > 0) callbackUrl += `?${queryParams.join('&')}`;

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          preferred_language: data.preferred_language,
        },
        emailRedirectTo: callbackUrl,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Subscribe to newsletter if opted in
    if (data.subscribe_newsletter) {
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.full_name }),
      }).catch(() => {});
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardContent className="space-y-4 pt-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Check Your Email!</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a confirmation link to your email. Please click it to activate your account before logging in.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or try logging in to resend.
            </p>
            <Link href={`/${locale}/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
              <Button className="mt-4">{t('signIn')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <Logo locale={locale} size={56} />
          </div>
          <div>
            <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t('registerSubtitle')}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="full_name">{t('fullName')}</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="full_name" className="pl-10" placeholder="Your full name" {...register('full_name')} />
              </div>
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" className="pl-10" placeholder="you@example.com" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" type="tel" className="pl-10" placeholder="+41 79 123 45 67" {...register('phone')} />
              </div>
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  {...register('confirm_password')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_language">{t('preferredLanguage')}</Label>
              <select
                id="preferred_language"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('preferred_language')}
              >
                {LOCALES.map((loc) => (
                  <option key={loc} value={loc}>
                    {LOCALE_LABELS[loc].flag} {LOCALE_LABELS[loc].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="accept_terms" {...register('accept_terms')} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="accept_terms" className="text-sm font-normal">
                {t('acceptTerms')}{' '}
                <Link href={`/${locale}/terms`} className="text-primary hover:underline" target="_blank">
                  Terms
                </Link>
              </Label>
            </div>
            {errors.accept_terms && <p className="text-xs text-destructive">{errors.accept_terms.message}</p>}

            <div className="flex items-center gap-2">
              <input type="checkbox" id="subscribe_newsletter" {...register('subscribe_newsletter')} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="subscribe_newsletter" className="text-sm font-normal">
                {t('subscribeNewsletter')}
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('signUp')}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t('hasAccount')}{' '}
              <Link href={`/${locale}/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="font-medium text-primary hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
