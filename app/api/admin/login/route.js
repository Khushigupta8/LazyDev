import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { verifyPassword, setSessionCookie, rateLimited, clientIp } from '@/lib/auth';

export async function POST(request) {
  if (rateLimited('login:' + clientIp(request), 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  const { username, password } = await request.json().catch(() => ({}));
  const db = await readDb();
  if (username !== db.admin.username || !password || !verifyPassword(password, db.admin.salt, db.admin.hash)) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, db);
  return res;
}
