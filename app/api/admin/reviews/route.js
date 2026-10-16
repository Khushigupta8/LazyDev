import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { adminOnly } from '@/lib/auth';

export const GET = adminOnly(async () => NextResponse.json((await readDb()).reviews));
