import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { canAccessStore } from '@/lib/access-scope';

/** DELETE: remove store manager (admin/super_admin with access). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { session, error } = await requireRole(['super_admin', 'admin']);
  if (error) return error;

  const { id: storeId, userId } = await params;
  const role = (session!.user as { role?: string }).role ?? 'user';
  const canAccess = await canAccessStore(session!.user!.id!, storeId, role);
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deleted = await prisma.storeManager.deleteMany({
    where: { storeId, userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Manager assignment not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
