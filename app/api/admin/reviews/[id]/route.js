import { NextResponse } from 'next/server';
import { updateDb, now } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { REVIEW_STATUSES } from '@/lib/validate';

export const PATCH = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  const item = await updateDb((db) => {
    const r = db.reviews.find((x) => x.id === id);
    if (!r) return null;
    if (REVIEW_STATUSES.includes(b.status)) r.status = b.status;
    r.updatedAt = now();
    return r;
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
});

export const DELETE = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  await updateDb((db) => {
    db.reviews = db.reviews.filter((x) => x.id !== id);
  });
  return NextResponse.json({ ok: true });
});
