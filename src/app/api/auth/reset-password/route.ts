import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

/**
 * POST /api/auth/reset-password
 * Body: { token: string, email: string, newPassword: string }
 * Verifies the token, updates user password, deletes the token.
 */
export async function POST(request: Request) {
  try {
    const { token, email, newPassword } = await request.json();

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { error: 'Token, email, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const verification = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: normalizedEmail, token } },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 });
    }

    if (verification.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: normalizedEmail, token } },
      });
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { identifier_token: { identifier: normalizedEmail, token } },
      }),
    ]);

    return NextResponse.json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
