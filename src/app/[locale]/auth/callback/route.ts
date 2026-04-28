import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en';

  // Handle code exchange (OAuth or PKCE email links)
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If this is a password recovery flow, redirect to reset-password page
      // Supabase sets the session with a recovery type — detect it from the URL
      const type = searchParams.get('type');
      if (type === 'recovery') {
        // Extract locale from the request path
        const localeMatch = request.url.match(/\/([a-z]{2})\/auth\/callback/);
        const locale = localeMatch ? localeMatch[1] : 'en';
        return NextResponse.redirect(`${origin}/${locale}/reset-password`);
      }
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
