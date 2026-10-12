import { NextResponse } from 'next/server';
import { readDb, updateDb, uid, byOrder } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { cleanService } from '@/lib/validate';

export const GET = adminOnly(async () => NextResponse.json([...(await readDb()).services].sort(byOrder)));

export const POST = adminOnly(async (request) => {
  const s = cleanService(await request.json().catch(() => ({})));
  if (!s.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  s.id = uid();
  await updateDb((db) => db.services.push(s));
  return NextResponse.json(s);
});
