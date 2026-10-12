import { NextResponse } from 'next/server';
import { updateDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { cleanProject } from '@/lib/validate';

export const PUT = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  if (!String(b.title || '').trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const p = await updateDb((db) => {
    const i = db.projects.findIndex((x) => x.id === id);
    if (i < 0) return null;
    db.projects[i] = cleanProject(b, db.projects[i]);
    return db.projects[i];
  });
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(p);
});

export const DELETE = adminOnly(async (request, ctx) => {
  const { id } = await ctx.params;
  await updateDb((db) => {
    db.projects = db.projects.filter((x) => x.id !== id);
  });
  return NextResponse.json({ ok: true });
});
