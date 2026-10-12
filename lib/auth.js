import 'server-only';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { readDb } from './db';

export const COOKIE = 'ld_admin';
const SESSION_SECONDS = 12 * 3600;

export function verifyPassword(password, salt, hash) {
  const test = crypto.scryptSync(String(password), salt, 64);
  const known = Buffer.from(hash, 'hex');
  return test.length === known.length && crypto.timingSafeEqual(test, known);
}

// The key includes the password hash, so changing the password logs out every session.
function key(db) {
  return (process.env.SESSION_SECRET || db.secret) + db.admin.hash;
}
function sign(value, db) {
  return crypto.createHmac('sha256', key(db)).update(value).digest('hex');
}

export function setSessionCookie(res, db) {
  const exp = String(Date.now() + SESSION_SECONDS * 1000);
  res.cookies.set(COOKIE, exp + '.' + sign(exp, db), {
    httpOnly: true,
    sameSite: 'strict',
    // Set INSECURE_COOKIES=1 only if testing a production build over plain http
    secure: process.env.NODE_ENV === 'production' && process.env.INSECURE_COOKIES !== '1',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function isAuthed(request) {
  const token = request.cookies.get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = sign(exp, await readDb());
  return sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/** Wrap an admin route handler so it returns 401 when not logged in. */
export function adminOnly(handler) {
  return async (request, ctx) => {
    if (!(await isAuthed(request))) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    try {
      return await handler(request, ctx);
    } catch (e) {
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  };
}

/* Simple in-memory rate limiter (per server process) */
const hits = new Map();
export function rateLimited(key, limit, windowMs) {
  const t = Date.now();
  const list = (hits.get(key) || []).filter((x) => t - x < windowMs);
  list.push(t);
  hits.set(key, list);
  return list.length > limit;
}
export function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
}
