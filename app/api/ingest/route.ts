import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { upsertHubFromLpos } from '@/lib/db';
import type { IngestHubPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * LPOS → this app. On saving a hub in LPOS, LPOS POSTs the hub's full projection
 * here (one payload or an array). Full-replace per hub, idempotent.
 * Auth: shared secret in the `x-lpos-token` header (LPOS_INGEST_TOKEN).
 */
function authorized(provided: string | null): boolean {
  const expected = process.env.LPOS_INGEST_TOKEN ?? '';
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!authorized(req.headers.get('x-lpos-token'))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as IngestHubPayload | IngestHubPayload[] | null;
  if (!body) return NextResponse.json({ ok: false, error: 'bad payload' }, { status: 400 });

  const payloads = Array.isArray(body) ? body : [body];
  for (const p of payloads) upsertHubFromLpos(p);

  return NextResponse.json({ ok: true, hubs: payloads.length });
}
