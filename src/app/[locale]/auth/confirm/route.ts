import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/app/api/email/send/route';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email_change' | null;
  const next = searchParams.get('next') ?? '/en/welcome';

  console.log('auth/confirm received params:', { token_hash: !!token_hash, type, next, fullUrl: request.url });

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
        const localeMatch = request.url.match(/\/([a-z]{2})\/auth\/confirm/);
        const locale = localeMatch ? localeMatch[1] : 'en';
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
  return NextResponse.redirect(`${origin}/en/login?error=email_confirmation_failed`);
}
