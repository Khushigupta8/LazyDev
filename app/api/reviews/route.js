import { NextResponse, after } from 'next/server';
import { updateDb, readDb, uid, now, str } from '@/lib/db';
import { sendReviewEmail } from '@/lib/email';
import { rateLimited, clientIp } from '@/lib/auth';

export async function POST(request) {
  if (rateLimited('rev:' + clientIp(request), 3, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a few minutes.' }, { status: 429 });
  }
  const b = await request.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: silently drop bots

  const review = {
    id: uid(),
    name: str(b.name, 80),
    email: str(b.email, 160),
    role: str(b.role, 120),
    service: str(b.service, 120),
    rating: Math.min(5, Math.max(1, Math.round(+b.rating) || 5)),
    message: str(b.message, 1500),
    status: 'pending', // nothing shows on the site until it is approved in the admin panel
    createdAt: now(),
  };
  if (!review.name || review.message.length < 10) {
    return NextResponse.json({ error: 'Please add your name and a few words about your experience.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(review.email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  await updateDb((db) => db.reviews.unshift(review));

  const siteUrl = process.env.SITE_URL || new URL(request.url).origin;
  after(async () => sendReviewEmail(review, (await readDb()).settings, siteUrl));
  return NextResponse.json({ ok: true });
}
