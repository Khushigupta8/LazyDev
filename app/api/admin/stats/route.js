import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';

export const GET = adminOnly(async () => {
  const db = await readDb();
  const e = db.enquiries;
  const weekAgo = Date.now() - 7 * 86400000;
  const count = (s) => e.filter((x) => x.status === s).length;
  return NextResponse.json({
    enquiries: e.length,
    newEnquiries: count('new'),
    inProgress: count('in-progress'),
    won: count('won'),
    thisWeek: e.filter((x) => new Date(x.createdAt).getTime() > weekAgo).length,
    projects: db.projects.length,
    services: db.services.filter((s) => s.status === 'active').length,
    pendingReviews: db.reviews.filter((r) => r.status === 'pending').length,
    recent: e.slice(0, 5),
  });
});
