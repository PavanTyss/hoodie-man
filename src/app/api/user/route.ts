import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

/**
 * GET /api/user - Returns current user profile (name, email). Auth required.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, newsletter: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/**
 * PATCH /api/user - Update name, email, or password. Auth required.
 * Body: { name?, email?, currentPassword?, newPassword? }
 */
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updates: { name?: string; email?: string; password?: string } = {};

    if (name !== undefined && typeof name === 'string') {
      updates.name = name.trim() || undefined;
    }

    if (email !== undefined && typeof email === 'string') {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: { email: { equals: trimmed, mode: 'insensitive' }, id: { not: session.user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      updates.email = trimmed;
    }

    if (newPassword !== undefined && typeof newPassword === 'string') {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }
      if (!user.password) {
        return NextResponse.json(
          { error: 'Current password required to set new password' },
          { status: 400 }
        );
      }
      const { compare } = await import('bcryptjs');
      const valid = await compare(String(currentPassword ?? ''), user.password);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      updates.password = await hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(user);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: { id: true, name: true, email: true, newsletter: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
