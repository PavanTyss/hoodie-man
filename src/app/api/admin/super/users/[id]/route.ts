import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-role';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.enum(['super_admin', 'admin', 'store_manager', 'delivery_agent', 'user']),
});

/** GET: fetch single user by id (super_admin only). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

/** DELETE: delete user (super_admin only). Safeguards: cannot delete self, cannot delete last super_admin. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  const currentUserId = session!.user!.id!;
  const { id: userId } = await params;

  if (userId === currentUserId) {
    return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (target.role === 'super_admin') {
    const superAdminCount = await prisma.user.count({ where: { role: 'super_admin' } });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last super admin' },
        { status: 400 }
      );
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  await writeAuditLog({
    actorId: currentUserId,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'user_deleted',
    entityType: 'user',
    entityId: userId,
    details: { deletedEmail: target.email, deletedRole: target.role },
  });

  return NextResponse.json({ success: true });
}

/** PATCH: update user role (super_admin only). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
    select: { id: true, email: true, name: true, role: true },
  });

  await writeAuditLog({
    actorId: session!.user!.id,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'role_change',
    entityType: 'user',
    entityId: user.id,
    details: { previousRole: target.role, newRole: user.role },
  });

  return NextResponse.json(user);
}
