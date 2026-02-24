import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 * Creates a reset token and sends email (or in dev, logs the link).
 * Token stored in VerificationToken; identifier = email.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, you will receive a reset link.' });
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier: normalizedEmail } }),
      prisma.verificationToken.create({
        data: { identifier: normalizedEmail, token, expires },
      }),
    ]);

    // TODO: Send email with link: `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`
    // Using Resend, SendGrid, or Nodemailer. For now log in development:
    if (process.env.NODE_ENV === 'development') {
      const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
      const resetLink = `${base}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
      console.log('[Forgot password] Reset link:', resetLink);
    }

    return NextResponse.json({ message: 'If an account exists, you will receive a reset link.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
