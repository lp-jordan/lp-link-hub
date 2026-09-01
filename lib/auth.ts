import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Thin, dependency-free magic-link + session auth.
 * A token is  base64url(payload) + "." + base64url(HMAC-SHA256(payload)).
 * Same scheme signs both the emailed magic-link token and the session cookie.
 */

const SESSION_COOKIE = 'hub_session';
const MAGIC_TTL_MS = 20 * 60 * 1000; // 20 min
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret(): string {
  const s = process.env.LINK_HUB_SECRET;
  if (!s || s.length < 16) throw new Error('LINK_HUB_SECRET is missing or too short');
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function sign(payload: object): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const mac = b64url(createHmac('sha256', secret()).update(body).digest());
  return `${body}.${mac}`;
}

function verify<T>(token: string): T | null {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = b64url(createHmac('sha256', secret()).update(body).digest());
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(fromB64url(body).toString('utf8')) as { exp?: number };
    if (typeof data.exp === 'number' && Date.now() > data.exp) return null;
    return data as T;
  } catch {
    return null;
  }
}

// ── magic link ───────────────────────────────────────────────────────────────

export function mintMagicToken(email: string): string {
  return sign({ email: email.toLowerCase(), exp: Date.now() + MAGIC_TTL_MS, k: 'magic' });
}

export function verifyMagicToken(token: string): string | null {
  const data = verify<{ email: string; k: string }>(token);
  return data && data.k === 'magic' ? data.email : null;
}

// ── session cookie ─────────────────────────────────────────────────────────────

export function startSession(email: string): void {
  const value = sign({ email: email.toLowerCase(), exp: Date.now() + SESSION_TTL_MS, k: 'sess' });
  cookies().set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

/** The logged-in email, or null. Read in server components / route handlers. */
export function sessionEmail(): string | null {
  const c = cookies().get(SESSION_COOKIE)?.value;
  if (!c) return null;
  const data = verify<{ email: string; k: string }>(c);
  return data && data.k === 'sess' ? data.email : null;
}

export function endSession(): void {
  cookies().delete(SESSION_COOKIE);
}
