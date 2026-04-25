import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/en';

  // Handle OAuth code exchange (Google, etc.)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
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
