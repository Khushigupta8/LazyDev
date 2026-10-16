import 'server-only';
import { str } from './db';

const list = (v, max, len) =>
  Array.isArray(v) ? v.map((t) => str(t, len)).filter(Boolean).slice(0, max) : [];
const num = (v) => (Number.isFinite(+v) ? +v : 99);

export const ENQUIRY_STATUSES = ['new', 'in-progress', 'won', 'closed'];
export const REVIEW_STATUSES = ['pending', 'approved', 'hidden'];
const SERVICE_STATUSES = ['active', 'coming-soon', 'hidden'];

export function cleanProject(b, existing = {}) {
  return {
    ...existing,
    title: str(b.title, 160),
    client: str(b.client, 160),
    category: str(b.category, 80) || 'Website',
    description: str(b.description, 3000),
    url: /^https?:\/\//i.test(str(b.url)) ? str(b.url, 500) : '',
    image: str(b.image, 500),
    tags: list(b.tags, 12, 40),
    year: str(b.year, 10),
    featured: !!b.featured,
    hidden: !!b.hidden,
    order: num(b.order),
  };
}

export function cleanService(b, existing = {}) {
  return {
    ...existing,
    title: str(b.title, 120),
    tag: str(b.tag, 40),
    icon: str(b.icon, 30) || 'sparkle',
    description: str(b.description, 1000),
    features: list(b.features, 10, 60),
    price: str(b.price, 60),
    status: SERVICE_STATUSES.includes(b.status) ? b.status : 'active',
    order: num(b.order),
  };
}

const SETTING_KEYS = ['brandName', 'heroKicker', 'heroWord', 'heroTagline', 'heroSubtitle', 'intro', 'ctaLabel',
  'availability', 'email', 'phone', 'whatsapp', 'location', 'instagram', 'linkedin', 'behance',
  'ownerName', 'ownerRole', 'quote'];

export function applySettings(settings, b) {
  SETTING_KEYS.forEach((k) => {
    if (b[k] !== undefined) settings[k] = str(b[k], 1000);
  });
  // Photo must be an uploaded file or an http(s) URL
  if (b.photo !== undefined) {
    const p = str(b.photo, 500);
    settings.photo = p.startsWith('/uploads/') || /^https?:\/\//i.test(p) ? p : '';
  }
  if (Array.isArray(b.highlights)) {
    settings.highlights = b.highlights
      .map((h) => ({ title: str(h?.title, 80), text: str(h?.text, 200) }))
      .filter((h) => h.title)
      .slice(0, 8);
  }
  if (Array.isArray(b.stats)) {
    settings.stats = b.stats
      .map((s) => ({ value: str(s?.value, 20), label: str(s?.label, 60) }))
      .filter((s) => s.value && s.label)
      .slice(0, 4);
  }
  return settings;
}
