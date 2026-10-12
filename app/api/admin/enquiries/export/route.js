import { readDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';

const COLS = ['createdAt', 'name', 'email', 'phone', 'company', 'service', 'budget', 'timeline', 'status', 'message', 'notes'];

function cell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = "'" + s; // block spreadsheet formula injection
  return '"' + s.replace(/"/g, '""') + '"';
}

export const GET = adminOnly(async () => {
  const rows = (await readDb()).enquiries.map((r) => COLS.map((c) => cell(r[c])).join(','));
  const csv = '﻿' + [COLS.join(','), ...rows].join('\r\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="enquiries.csv"',
    },
  });
});
