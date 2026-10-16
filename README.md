# Khushii Labs — agency website + admin panel (Next.js)

## Run it
```bash
npm install      # first time only
npm run dev      # http://localhost:3000   (admin: http://localhost:3000/admin)
```
Production: `npm run build` then `npm start`.

**Default admin login:** `admin` / `lazydev@admin`. Change it right away in **Admin → Settings → Admin login**
(or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first run).

## What's where
| Path | What it is |
|---|---|
| `app/(site)/page.js` | Home page (hero, services, portfolio, process, FAQ, enquiry form) |
| `app/(site)/work/page.js` | Full portfolio with category filters |
| `app/(site)/privacy-policy/page.js` | Privacy policy |
| `app/not-found.js` | Custom 404 page |
| `app/robots.js`, `app/sitemap.js` | `/robots.txt` and `/sitemap.xml` |
| `lib/site.js` | Site URL, per-page SEO metadata (title, description, canonical, Open Graph) |
| `next.config.mjs` | 301 redirects for changed URLs |
| `app/admin` + `components/admin/*` | Admin panel: dashboard, enquiries, portfolio, services, settings |
| `app/globals.css` | Site design system: colour palette in `:root` |
| `app/api/*` | Enquiry form + admin APIs |
| `public/og-image.png` | Image shown when the site is shared on social media / WhatsApp |

## Environment variables
See `.env.example`. For launch on Vercel you need:
- `SITE_URL`: the live domain (canonical tags, sitemap, Open Graph all use it)
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET`): where content and enquiries are stored
- `RESEND_API_KEY` + `EMAIL_FROM`: so the enquiry form emails you and the client
- `NEXT_PUBLIC_GA_ID` (Google Analytics) and `GOOGLE_SITE_VERIFICATION` (Search Console), optional

Locally, without Supabase, data is stored in `data/db.json`.

## Images
Portfolio and profile images are WebP. Uploads from the admin are converted to WebP automatically.

## Adding new services later
Admin → Services → **Add service**. Set status to *Coming soon* to tease it, *Active* to show it as a full card.
