import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en';

  console.log('auth/callback received params:', { code: !!code, type: searchParams.get('type'), next, fullUrl: request.url });

  // Handle code exchange (OAuth or PKCE email links)
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('Code exchanged successfully, checking for recovery flow');
      
      // Check if this is a password recovery flow by examining the auth state
      // After exchangeCodeForSession, Supabase sets a session with recovery state
      const { data: { session } } = await supabase.auth.getSession();
      
      // For password reset, check the auth state's recovery flag
      // or check if the URL has type=recovery
      const type = searchParams.get('type');
      const isRecovery = type === 'recovery' || 
                        (session?.user?.user_metadata?.recovery === true) ||
                        (session?.user?.app_metadata?.recovery === true);
      
      if (isRecovery) {
        console.log('Recovery flow detected, redirecting to reset-password');
        const localeMatch = request.url.match(/\/([a-z]{2})\/auth\/callback/);
        const locale = localeMatch ? localeMatch[1] : 'en';
        return NextResponse.redirect(`${origin}/${locale}/reset-password`);
      }
      
      console.log('Not a recovery flow, redirecting to:', next);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle email confirmation redirect from Supabase
  // Supabase redirects here after email verification with a success/error message
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (error) {
    return NextResponse.redirect(`${origin}/en/login?error=email_confirmation_failed&message=${encodeURIComponent(errorDescription || '')}`);
  }

  // Successful email confirmation - redirect to login with success message
  return NextResponse.redirect(`${origin}/en/login?confirmed=true`);
}
