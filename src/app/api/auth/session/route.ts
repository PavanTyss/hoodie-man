import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/** Explicit session endpoint so GET /api/auth/session is always handled (avoids 404 with catch-all). */
export async function GET() {
  const session = await auth();
  return NextResponse.json(session ?? {});
}
