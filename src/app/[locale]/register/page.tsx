'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Mail, Lock, User as UserIcon } from 'lucide-react';
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          preferred_language: data.preferred_language,
        },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
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
            <h2 className="text-xl font-bold">{t('checkEmail')}</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a confirmation link to your email. Please click it to activate your account.
            </p>
            <Link href={`/${locale}/login`}>
              <Button variant="outline" className="mt-4">{t('signIn')}</Button>
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
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" className="pl-10" placeholder="••••••••" {...register('password')} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirm_password" type="password" className="pl-10" placeholder="••••••••" {...register('confirm_password')} />
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
              <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
