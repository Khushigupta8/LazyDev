import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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
  // PNG / JPG are converted to WebP (smaller, faster pages). GIFs keep their animation.
  let body = Buffer.from(await file.arrayBuffer());
  let type = file.type;
  if (type === 'image/png' || type === 'image/jpeg') {
    body = await sharp(body).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    type = 'image/webp';
  }
  const name = Date.now() + '-' + uid() + TYPES[type];

  // On Vercel: store in Vercel Blob (permanent public URL)
  if (useBlob) {
    const blob = await put('uploads/' + name, body, { access: 'public', contentType: type });
    return NextResponse.json({ url: blob.url });
  }

  // Locally: save into /public/uploads
  const dir = path.join(process.cwd(), 'public', 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), body);
  return NextResponse.json({ url: '/uploads/' + name });
});
