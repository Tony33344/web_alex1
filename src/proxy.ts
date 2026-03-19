import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/profile', '/membership/checkout'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes and admin routes
  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    // For admin routes, check auth
    if (pathname.startsWith('/admin')) {
      const { user, supabase, supabaseResponse } = await updateSession(request);

      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/en/login';
        return NextResponse.redirect(url);
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = '/en/login';
        return NextResponse.redirect(url);
      }

      return supabaseResponse;
    }

    return NextResponse.next();
  }

  // Refresh Supabase session
  const { user, supabaseResponse } = await updateSession(request);

  // Check protected routes
  const strippedPath = pathname.replace(/^\/(en|de|it|fr|hi|si)/, '');

  if (protectedRoutes.some((route) => strippedPath.startsWith(route))) {
    if (!user) {
      const locale = pathname.split('/')[1] || 'en';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Apply intl middleware
  const intlResponse = intlMiddleware(request);

  // Copy Supabase cookies to the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
