/**
 * Public site URL, used for canonical tags, the sitemap, Open Graph and JSON-LD.
 * Set SITE_URL (e.g. https://khushiilabs.com) in production; Vercel's production domain is the fallback.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:3000'
).replace(/\/$/, '');

export const absoluteUrl = (path = '/') => (/^https?:\/\//.test(path) ? path : SITE_URL + (path.startsWith('/') ? path : '/' + path));

/**
 * Per-page metadata: unique title + description, canonical URL and Open Graph / Twitter tags.
 * (A page's `openGraph` replaces its parent's, so every page sets the full object.)
 */
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'Khushii Labs: website design and development' };

export function pageMeta({ settings, title, description, path }) {
  const brand = settings.brandName;
  const fullTitle = title ? `${title} · ${brand}` : `${brand} | Website Design & Development`;
  return {
    title: title || { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: brand, locale: 'en_IN', url: path, title: fullTitle, description, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}

/** The bundled photos in /public/uploads are WebP now; map the old .jpg paths still stored in existing databases. */
const BUNDLED_JPG = /^\/uploads\/(khushi-professional|work-[a-z0-9-]+)\.jpg$/;
export const toWebp = (src) => (typeof src === 'string' && BUNDLED_JPG.test(src) ? src.replace(/\.jpg$/, '.webp') : src);