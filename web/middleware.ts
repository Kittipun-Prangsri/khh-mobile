import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

// Routes that must stay reachable without a browser session.
const PUBLIC_PATHS = new Set([
  '/', // login page
  '/api/hosxp/auth/login',
  '/api/hosxp/auth/logout',
  '/api/line/webhook', // called by LINE's servers, not the browser
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Cron endpoints are invoked by a scheduler, not a logged-in browser.
  // They need their own shared-secret check (separate follow-up step) —
  // excluded here so this step doesn't accidentally break scheduled jobs.
  if (pathname.startsWith('/api/cron/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'ไม่ได้เข้าสู่ระบบ หรือ session หมดอายุ กรุณาเข้าสู่ระบบใหม่' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the verified identity to downstream route handlers, so API
  // routes can read `x-khh-user-id` / `x-khh-user-role` without re-verifying.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-khh-user-id', session.id);
  requestHeaders.set('x-khh-user-role', session.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static assets.
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
