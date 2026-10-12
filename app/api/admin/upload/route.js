import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { uid } from '@/lib/db';
import { adminOnly } from '@/lib/auth';

const TYPES = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };
const MAX_BYTES = 4 * 1024 * 1024; // Vercel functions accept request bodies up to 4.5 MB
const useBlob = !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const POST = adminOnly(async (request) => {
  const form = await request.formData();
  const file = form.get('image');
  if (!file || typeof file === 'string' || !TYPES[file.type]) {
    return NextResponse.json({ error: 'Please upload a PNG, JPG, WEBP or GIF image' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image must be under 4 MB' }, { status: 400 });
  }
  const name = Date.now() + '-' + uid() + TYPES[file.type];

  // On Vercel: store in Vercel Blob (permanent public URL)
  if (useBlob) {
    const blob = await put('uploads/' + name, file, { access: 'public', contentType: file.type });
    return NextResponse.json({ url: blob.url });
  }

  // Locally: save into /public/uploads
  const dir = path.join(process.cwd(), 'public', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: '/uploads/' + name });
});
