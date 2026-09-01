import { NextResponse } from 'next/server';
import { startSession } from '@/lib/auth';

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
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;
  const email = (new URL(req.url).searchParams.get('email') ?? '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.redirect(`${origin}/signin`);
  }
  startSession(email);
  return NextResponse.redirect(`${origin}/`);
}
