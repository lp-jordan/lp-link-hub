import { NextResponse } from 'next/server';
import { SESSION_COOKIE, makeSessionValue, sessionCookieOptions, appOrigin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Demo-only one-click sign-in — bypasses the magic-link email.
 * Hard-gated behind LINK_HUB_DEMO=1; returns 404 otherwise so it can never be a
 * backdoor on a real instance.  GET /api/auth/demo?email=…  → start a session.
 */
export async function GET(req: Request) {
  if (process.env.LINK_HUB_DEMO !== '1') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const origin = appOrigin(req);
  const email = (new URL(req.url).searchParams.get('email') ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.redirect(`${origin}/signin`);
  }
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set(SESSION_COOKIE, makeSessionValue(email), sessionCookieOptions());
  return res;
}
