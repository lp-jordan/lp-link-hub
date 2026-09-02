import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, appOrigin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/auth/signout — clear the session and return to sign-in. */
export async function GET(req: Request) {
  const res = NextResponse.redirect(`${appOrigin(req)}/signin`);
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
