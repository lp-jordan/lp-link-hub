import { NextResponse } from 'next/server';
import { mintMagicToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST { email } → email a magic sign-in link.
 * We mint regardless of whether the email has access (don't leak which emails
 * are provisioned); the callback simply grants a session, and each hub still
 * checks access on entry. In dev the link is returned so you can click through.
 */
export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const clean = (email ?? '').trim().toLowerCase();
  if (!clean || !clean.includes('@')) {
    return NextResponse.json({ ok: false, error: 'invalid email' }, { status: 400 });
  }

  const token = mintMagicToken(clean);
  const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || new URL(req.url).origin;
  const link = `${origin}/api/auth/callback?token=${encodeURIComponent(token)}`;

  // TODO: send `link` to `clean` via the real email sender (the one LPOS uses).
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) console.log('[magic-link]', clean, '→', link);

  return NextResponse.json({ ok: true, ...(isDev ? { devLink: link } : {}) });
}
