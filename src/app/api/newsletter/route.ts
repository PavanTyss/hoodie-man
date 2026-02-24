import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsletterRateLimiter } from '@/lib/rateLimit';
import { sanitizeEmail, isValidEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = newsletterRateLimiter(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeEmail(email);

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existing && existing.subscribed) {
      return NextResponse.json(
        { message: 'Already subscribed', alreadySubscribed: true },
        { status: 200 }
      );
    }

    const newsletter = await prisma.newsletter.upsert({
      where: { email: sanitizedEmail },
      update: { subscribed: true },
      create: { email: sanitizedEmail, subscribed: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      newsletter,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}
