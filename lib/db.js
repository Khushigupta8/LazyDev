import 'server-only';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Redis } from '@upstash/redis';
import initialContent from '@/data/initial.json';

/**
 * Data storage
 * - On Vercel (or anywhere with Upstash Redis env vars set): the whole site database is one JSON
 *   document in Redis, so it survives deploys.
 * - Locally (no Redis env vars): stored in /data/db.json.
 * On first run the database is seeded from /data/initial.json (your site content) plus the
 * admin login from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const REDIS_KEY = 'lazydev:db';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

export const uid = () => crypto.randomBytes(8).toString('hex');
export const now = () => new Date().toISOString();
export const str = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}

// Personal-brand fields. Merged into older databases so new settings always have a value.
export const PERSONAL_DEFAULTS = {
  ownerName: 'Your Name',
  ownerRole: 'Web Designer & Developer',
  photo: '',
  quote: 'Design is not just what it looks like. It is how it makes your customers feel.',
  highlights: [
    { title: 'Fixed, transparent pricing', text: 'You know the full cost before any work begins.' },
    { title: 'Launch in 2 to 3 weeks', text: 'Most business websites go live within a month.' },
    { title: 'Mobile-first & SEO-ready', text: 'Fast on every phone and ready for Google.' },
    { title: 'Support after launch', text: 'Updates, fixes and changes whenever you need them.' },
  ],
};

function seed() {
  const password = process.env.ADMIN_PASSWORD;
  const { salt, hash } = hashPassword(password || 'lazydev@admin');
  const content = structuredClone(initialContent);
  return {
    admin: { username: process.env.ADMIN_EMAIL || 'admin', salt, hash, isDefault: !password },
    secret: crypto.randomBytes(32).toString('hex'),
    settings: content.settings || {},
    services: content.services || [],
    projects: content.projects || [],
    enquiries: [],
  };
}

function normalise(db) {
  db.settings = { ...PERSONAL_DEFAULTS, ...db.settings };
  db.services ||= [];
  db.projects ||= [];
  db.enquiries ||= [];
  return db;
}

// On Vercel the file system is read-only. Until Redis is connected, serve the bundled content.
const readOnlyHost = !!process.env.VERCEL && !redis;
let readOnlyDb;

export async function readDb() {
  if (readOnlyHost) return normalise((readOnlyDb ||= seed()));
  if (redis) {
    let db = await redis.get(REDIS_KEY);
    if (!db) {
      db = seed();
      await redis.set(REDIS_KEY, db);
    }
    return normalise(db);
  }
  if (!fs.existsSync(DB_FILE)) {
    const db = seed();
    await writeDb(db);
    return normalise(db);
  }
  return normalise(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
}

export async function writeDb(db) {
  if (readOnlyHost) {
    throw new Error('Storage is not connected yet. In Vercel, add Upstash Redis to this project, then redeploy.');
  }
  if (redis) {
    await redis.set(REDIS_KEY, db);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DB_FILE + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

/** Read-modify-write helper. `fn` mutates db and returns a value. */
export async function updateDb(fn) {
  const db = await readDb();
  const result = fn(db);
  await writeDb(db);
  return result;
}

/** Public, safe-to-expose site data */
export async function getSiteData() {
  const db = await readDb();
  return {
    settings: db.settings,
    services: db.services.filter((s) => s.status !== 'hidden').sort(byOrder),
    projects: db.projects.filter((p) => !p.hidden).sort(byOrder),
  };
}
