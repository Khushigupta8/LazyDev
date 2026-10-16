import 'server-only';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import initialContent from '@/data/initial.json';
import { toWebp } from '@/lib/site';

/**
 * Data storage
 * - With Supabase env vars set: the whole site database is one JSON row in the `site_data` table
 *   (see supabase/schema.sql), so it survives deploys.
 * - Locally (no Supabase env vars): stored in /data/db.json.
 * On first run the database is seeded from /data/initial.json (your site content) plus the
 * admin login from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Supabase (Postgres) through its REST API. The service role key is server-only; never expose it.
const sbUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET;
const supabase = sbUrl && sbKey
  ? {
      async request(query, init = {}) {
        const res = await fetch(`${sbUrl}/rest/v1/site_data${query}`, {
          ...init,
          cache: 'no-store',
          headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}`, 'Content-Type': 'application/json', ...init.headers },
        });
        if (!res.ok) throw new Error(`Supabase error (${res.status}): ${await res.text()}`);
        return res;
      },
      async get() {
        const rows = await (await this.request('?id=eq.main&select=data')).json();
        return rows[0]?.data || null;
      },
      async set(db) {
        await this.request('', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ id: 'main', data: db, updated_at: new Date().toISOString() }),
        });
      },
    }
  : null;
const store = supabase;

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

// Fingerprint of the ADMIN_EMAIL / ADMIN_PASSWORD env vars, so we can tell when they are rotated.
const envLogin = (secret) =>
  process.env.ADMIN_PASSWORD
    ? crypto.createHmac('sha256', secret).update(`${process.env.ADMIN_EMAIL || 'admin'}:${process.env.ADMIN_PASSWORD}`).digest('hex')
    : '';

function adminFromEnv(secret) {
  const password = process.env.ADMIN_PASSWORD;
  const { salt, hash } = hashPassword(password || 'lazydev@admin');
  return { username: process.env.ADMIN_EMAIL || 'admin', salt, hash, isDefault: !password, envLogin: envLogin(secret) };
}

/** When the login env vars change (e.g. rotated in Vercel), reset the stored admin login to match. */
function syncAdmin(db) {
  const fp = envLogin(db.secret);
  if (!fp || db.admin?.envLogin === fp) return false;
  db.admin = adminFromEnv(db.secret);
  return true;
}

function seed() {
  const secret = crypto.randomBytes(32).toString('hex');
  const content = structuredClone(initialContent);
  return {
    admin: adminFromEnv(secret),
    secret,
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

// On Vercel the file system is read-only. Until Supabase is connected, serve the bundled content.
const readOnlyHost = !!process.env.VERCEL && !store;
let readOnlyDb;

export async function readDb() {
  if (readOnlyHost) return normalise((readOnlyDb ||= seed()));
  if (store) {
    let db = await store.get();
    if (!db) {
      db = seed();
      await store.set(db);
    } else if (syncAdmin(db)) {
      await store.set(db);
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
    throw new Error('Storage is not connected yet. Add the Supabase env vars in Vercel, then redeploy.');
  }
  if (store) {
    await store.set(db);
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
    settings: { ...db.settings, photo: toWebp(db.settings.photo) },
    services: db.services.filter((s) => s.status !== 'hidden').sort(byOrder),
    projects: db.projects.filter((p) => !p.hidden).sort(byOrder).map((p) => ({ ...p, image: toWebp(p.image) })),
  };
}
