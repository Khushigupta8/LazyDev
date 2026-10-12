import { NextResponse } from 'next/server';
import { updateDb, uid, now, str } from '@/lib/db';
import { rateLimited, clientIp } from '@/lib/auth';

export async function POST(request) {
  if (rateLimited('enq:' + clientIp(request), 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again in a few minutes.' }, { status: 429 });
  }
  const b = await request.json().catch(() => ({}));
  if (b.website) return NextResponse.json({ ok: true }); // honeypot: silently drop bots

  const enquiry = {
    id: uid(),
    name: str(b.name, 120),
    email: str(b.email, 160),
    phone: str(b.phone, 40),
    company: str(b.company, 160),
    service: str(b.service, 120),
    budget: str(b.budget, 60),
    timeline: str(b.timeline, 60),
    message: str(b.message, 5000),
    status: 'new',
    notes: '',
    createdAt: now(),
  };
  if (!enquiry.name || !enquiry.message) {
    return NextResponse.json({ error: 'Please share your name and a short message.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }
  await updateDb((db) => db.enquiries.unshift(enquiry));
  return NextResponse.json({ ok: true });
}
