import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');

  // If the user is not authenticated and is trying to access a protected route,
  // redirect them to the login page.
  if (!session && !isAuthPage && !isAuthCallback) {
    const redirectUrl = new URL('/login', request.url);
    if (request.nextUrl.pathname.startsWith('/diagram')) {
      redirectUrl.searchParams.set('redirect_to', request.nextUrl.pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is authenticated and is trying to access an authentication page,
  // redirect them to the home page.
  if (session && isAuthPage) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};