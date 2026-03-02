import { NextRequest } from 'next/server';
import { handlers } from '@/lib/auth';
import { authRateLimiter } from '@/lib/rateLimit';

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const rateLimitResult = authRateLimiter(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }
  return handlers.POST(request);
}
