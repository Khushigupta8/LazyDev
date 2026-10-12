import { NextResponse } from 'next/server';
import { updateDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { cleanService } from '@/lib/validate';

export const PUT = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  if (!String(b.title || '').trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const s = await updateDb((db) => {
    const i = db.services.findIndex((x) => x.id === id);
    if (i < 0) return null;
    db.services[i] = cleanService(b, db.services[i]);
    return db.services[i];
  });
  if (!s) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(s);
});

export const DELETE = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  await updateDb((db) => {
    db.services = db.services.filter((x) => x.id !== id);
  });
  return NextResponse.json({ ok: true });
});
