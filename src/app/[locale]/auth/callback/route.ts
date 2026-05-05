import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailTemplates, prepareEmail } from '@/lib/email/templates';
import { sendEmail } from '@/lib/email/transporter';

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
      console.log('Code exchanged successfully');
      
      const type = searchParams.get('type');
      const localeMatch = request.url.match(/\/([a-z]{2})\/auth\/callback/);
      const locale = localeMatch ? localeMatch[1] : 'en';
      
      // Send welcome email after email verification
      if (type === 'signup' || type === 'email_confirmation') {
        try {
          const adminSupabase = createAdminClient();
          const { data: profile } = await adminSupabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single();

          const userName = profile?.full_name || data.user.email?.split('@')[0] || 'there';
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          
          const emailContent = prepareEmail({
            to: data.user.email!,
            subject: 'Welcome to Infinity Role Teachers',
            template: EmailTemplates.WELCOME,
            variables: {
              user_name: userName,
              profile_url: `${appUrl}/${locale}/profile`,
              events_url: `${appUrl}/${locale}/events`,
              programs_url: `${appUrl}/${locale}/coach-training`,
              membership_url: `${appUrl}/${locale}/membership`,
            },
          });

          await sendEmail({
            to: data.user.email!,
            subject: emailContent.subject,
            html: emailContent.html,
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the auth flow if email fails
        }
      }
      
      // If type=recovery OR redirect_type=recovery, redirect to reset-password
      const redirectType = searchParams.get('redirect_type');
      if (type === 'recovery' || redirectType === 'recovery') {
        console.log('Recovery flow detected, redirecting to reset-password');
        return NextResponse.redirect(`${origin}/${locale}/reset-password`);
      }
      
      console.log('Redirecting to:', next);
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Code exchange failed:', error);
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
