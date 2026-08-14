import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Clears the httpOnly session cookie. Client-side JS can't delete an
 * httpOnly cookie directly, so logout has to go through this endpoint.
 */
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
