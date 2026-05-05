import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/app/api/email/send/route';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const code = searchParams.get('code');
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email_change' | null;
  const next = searchParams.get('next') ?? '/en/welcome';

  console.log('auth/confirm received params:', { token_hash: !!token_hash, code: !!code, type, next, fullUrl: request.url });

  const localeMatch = request.url.match(/\/([a-z]{2})\/auth\/confirm/);
  const locale = localeMatch ? localeMatch[1] : 'en';

  // PKCE recovery flow: exchange code for session then redirect to reset-password
  const redirectType = searchParams.get('redirect_type');
  if (code && (type === 'recovery' || redirectType === 'recovery')) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('PKCE recovery code exchanged in auth/confirm, redirecting to reset-password');
      return NextResponse.redirect(`${origin}/${locale}/reset-password`);
    }
    console.error('PKCE recovery code exchange failed in auth/confirm:', error.message);
    return NextResponse.redirect(`${origin}/${locale}/login?error=recovery_failed&message=${encodeURIComponent(error.message)}`);
  }

  // Legacy token_hash flow
  if (token_hash && type) {
    const supabase = await createClient();

    // Verify the email confirmation
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    console.log('verifyOtp result:', { error: error?.message, hasUser: !!data?.user });

    if (!error && data?.user) {
      // Password recovery — redirect to reset-password page
      if (type === 'recovery') {
        console.log('Recovery type detected in auth/confirm, redirecting to reset-password');
        return NextResponse.redirect(`${origin}/${locale}/reset-password`);
      }

      // Email verified successfully - send welcome email for new signups
      if (type === 'signup') {
        const userName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Friend';
        const dashboardUrl = `${origin}/en/welcome`;

        // Send welcome email (don't await - don't block redirect)
        sendWelcomeEmail(data.user.email!, userName, dashboardUrl).catch((err) => {
          console.error('Failed to send welcome email:', err);
        });
      }

      // Redirect to welcome page (user is now confirmed but needs to login)
      return NextResponse.redirect(`${origin}${next}?confirmed=true`);
    }
  }

  // If there's an error or missing params, redirect to login with error
  return NextResponse.redirect(`${origin}/${locale}/login?error=email_confirmation_failed`);
}
