import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';

export const GET = adminOnly(async () => {
  const { admin } = await readDb();
  return NextResponse.json({ username: admin.username, isDefaultPassword: !!admin.isDefault });
});
