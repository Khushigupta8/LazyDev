# LazyDev — agency website + admin panel (Next.js)

## Run it
```bash
npm install      # first time only
npm run dev      # http://localhost:3000   (admin: http://localhost:3000/admin)
```
Production: `npm run build` then `npm start`.

**Default admin login:** `admin` / `lazydev@admin` — change it right away in **Admin → Settings → Admin login**.
(Or set `ADMIN_PASSWORD` in `.env.local` *before* the first run.)

## What's where
| Path | What it is |
|---|---|
| `app/(site)/page.js` | Home page (hero, services, portfolio, process, FAQ, enquiry form) |
| `app/(site)/work/page.js` | Full portfolio with category filters |
| `app/admin` + `components/admin/*` | Admin panel: dashboard, enquiries, portfolio, services, settings |
| `components/Mascot3D.js` | The 3D bunny mascot (Three.js, built from code: colours at the top) |
| `app/globals.css` | Site design system: colour palette in `:root` |
| `app/api/*` | Enquiry form + admin APIs |
| `data/db.json` | All content & enquiries (auto-created). **Back this folder up.** |
| `data/uploads/` | Portfolio screenshots uploaded from the admin |

## Adding new services later
Admin → Services → **Add service**. Set status to *Coming soon* to tease it, *Active* to show it as a full card.

## Hosting
Data is saved to files, so host on something with a persistent disk: a VPS (Hostinger, DigitalOcean),
Railway or Render with a disk. Serverless hosts like Vercel won't keep enquiries/uploads.
