import { NextResponse } from 'next/server';
import { updateDb, now, str } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { ENQUIRY_STATUSES } from '@/lib/validate';

export const PATCH = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  const item = await updateDb((db) => {
    const e = db.enquiries.find((x) => x.id === id);
    if (!e) return null;
    if (ENQUIRY_STATUSES.includes(b.status)) e.status = b.status;
    if (b.notes !== undefined) e.notes = str(b.notes, 5000);
    e.updatedAt = now();
    return e;
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
});

export const DELETE = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  await updateDb((db) => {
    db.enquiries = db.enquiries.filter((x) => x.id !== id);
  });
  return NextResponse.json({ ok: true });
});
