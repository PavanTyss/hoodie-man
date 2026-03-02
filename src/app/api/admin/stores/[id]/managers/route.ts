import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { canAccessStore } from '@/lib/access-scope';
import { z } from 'zod';

const addManagerSchema = z.object({
  userId: z.string().min(1),
});

/** GET: list store managers (admin/super_admin with access). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole(['super_admin', 'admin']);
  if (error) return error;

  const { id: storeId } = await params;
  const role = (session!.user as { role?: string }).role ?? 'user';
  const canAccess = await canAccessStore(session!.user!.id!, storeId, role);
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const managers = await prisma.storeManager.findMany({
    where: { storeId },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });

  return NextResponse.json(managers);
}

/** POST: add store manager (admin/super_admin with access). User must exist and have store_manager or delivery_agent role. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole(['super_admin', 'admin']);
  if (error) return error;

  const { id: storeId } = await params;
  const role = (session!.user as { role?: string }).role ?? 'user';
  const canAccess = await canAccessStore(session!.user!.id!, storeId, role);
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = addManagerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (user.role !== 'store_manager' && user.role !== 'delivery_agent') {
    return NextResponse.json({ error: 'User must have store_manager or delivery_agent role' }, { status: 400 });
  }

  const existing = await prisma.storeManager.findUnique({
    where: { userId_storeId: { userId: parsed.data.userId, storeId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'User is already a manager for this store' }, { status: 409 });
  }

  const manager = await prisma.storeManager.create({
    data: { userId: parsed.data.userId, storeId },
    include: { user: { select: { id: true, email: true, name: true, role: true } } },
  });

  return NextResponse.json(manager);
}
