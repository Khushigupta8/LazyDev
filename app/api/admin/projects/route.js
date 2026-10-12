import { NextResponse } from 'next/server';
import { readDb, updateDb, uid, now, byOrder } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { cleanProject } from '@/lib/validate';

export const GET = adminOnly(async () => NextResponse.json([...(await readDb()).projects].sort(byOrder)));

export const POST = adminOnly(async (request) => {
  const p = cleanProject(await request.json().catch(() => ({})));
  if (!p.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  p.id = uid();
  p.createdAt = now();
  await updateDb((db) => db.projects.push(p));
  return NextResponse.json(p);
});
