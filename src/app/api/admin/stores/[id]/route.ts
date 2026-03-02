import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { canAccessStore } from '@/lib/access-scope';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

const updateStoreSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
});

/** GET: single store (admin/super_admin/store_manager with access). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (error) return error;

  const { id: storeId } = await params;
  const role = (session!.user as { role?: string }).role ?? 'user';
  const canAccess = await canAccessStore(session!.user!.id!, storeId, role);
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
      storeManagers: { include: { user: { select: { id: true, email: true, name: true } } } },
      _count: { select: { products: true } },
    },
  });

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json(store);
}

/** PATCH: update store (admin/super_admin with access). */
export async function PATCH(
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

  const parsed = updateStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  if (parsed.data.slug) {
    const existing = await prisma.store.findFirst({
      where: { slug: parsed.data.slug, id: { not: storeId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
    }
  }

  const store = await prisma.store.update({
    where: { id: storeId },
    data: parsed.data,
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });

  await writeAuditLog({
    actorId: session!.user!.id,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'store_updated',
    entityType: 'store',
    entityId: store.id,
    details: parsed.data,
  });

  return NextResponse.json(store);
}

/** DELETE: delete store (super_admin or admin with access). */
export async function DELETE(
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

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  await prisma.store.delete({ where: { id: storeId } });

  await writeAuditLog({
    actorId: session!.user!.id,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'store_deleted',
    entityType: 'store',
    entityId: storeId,
    details: { name: store.name, slug: store.slug },
  });

  return NextResponse.json({ success: true });
}
