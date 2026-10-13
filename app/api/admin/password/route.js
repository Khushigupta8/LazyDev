import { NextResponse } from 'next/server';
import { readDb, updateDb, hashPassword, str } from '@/lib/db';
import { adminOnly, verifyPassword, setSessionCookie } from '@/lib/auth';

export const POST = adminOnly(async (request) => {
  const { current, next, username } = await request.json().catch(() => ({}));
  const { admin } = await readDb();
  if (!verifyPassword(current || '', admin.salt, admin.hash)) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }
  if (!next || String(next).length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
  }
  const db = await updateDb((d) => {
    const { salt, hash } = hashPassword(String(next));
    d.admin = { ...d.admin, username: str(username, 60) || d.admin.username, salt, hash, isDefault: false };
    return d;
  });
  // Old sessions are now invalid; issue a fresh one for this browser.
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, db);
  return res;
});
