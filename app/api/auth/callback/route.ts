import { NextResponse } from 'next/server';
import { verifyMagicToken, SESSION_COOKIE, makeSessionValue, sessionCookieOptions, appOrigin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET ?token=… from the emailed link → verify, start a session, land on home. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const origin = appOrigin(req);

  const email = verifyMagicToken(token);
  if (!email) return NextResponse.redirect(`${origin}/signin?error=expired`);

  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set(SESSION_COOKIE, makeSessionValue(email), sessionCookieOptions());
  return res;
}
