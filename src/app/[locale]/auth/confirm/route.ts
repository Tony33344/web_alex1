import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email_change' | null;
  const next = searchParams.get('next') ?? '/en/welcome';

  if (token_hash && type) {
    const supabase = await createClient();
    
    // Verify the email confirmation
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Email verified successfully
      // Redirect to welcome page (user is now confirmed but needs to login)
      // Or we could redirect to login with a success message
      return NextResponse.redirect(`${origin}${next}?confirmed=true`);
    }
  }

  // If there's an error or missing params, redirect to login with error
  return NextResponse.redirect(`${origin}/en/login?error=email_confirmation_failed`);
}
