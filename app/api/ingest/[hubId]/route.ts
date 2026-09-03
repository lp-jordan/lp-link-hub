import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { deleteHub } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** DELETE /api/ingest/:hubId — LPOS tells this app to remove a hub. */
function authorized(provided: string | null): boolean {
  const expected = process.env.LPOS_INGEST_TOKEN ?? '';
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function DELETE(req: Request, { params }: { params: { hubId: string } }) {
  if (!authorized(req.headers.get('x-lpos-token'))) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  deleteHub(params.hubId);
  return NextResponse.json({ ok: true });
}
