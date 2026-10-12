import { NextResponse } from 'next/server';
import { readDb, updateDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { applySettings } from '@/lib/validate';

export const GET = adminOnly(async () => NextResponse.json((await readDb()).settings));

export const PUT = adminOnly(async (request) => {
  const b = await request.json().catch(() => ({}));
  const settings = await updateDb((db) => applySettings(db.settings, b));
  return NextResponse.json(settings);
});
