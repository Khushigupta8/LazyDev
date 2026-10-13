import { readDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';
import { clientEmail, ownerEmail, SAMPLE_ENQUIRY } from '@/lib/email';

// Preview the enquiry emails in the browser: /api/admin/email-preview?template=client|owner
export const GET = adminOnly(async (request) => {
  const url = new URL(request.url);
  const { settings } = await readDb();
  const siteUrl = process.env.SITE_URL || url.origin;
  const build = url.searchParams.get('template') === 'owner' ? ownerEmail : clientEmail;
  return new Response(build(SAMPLE_ENQUIRY, settings, siteUrl).html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});
