import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getOrderStoreId } from '@/lib/access-scope';
import { getStoreManagerStoreIds } from '@/lib/access-scope';
import { writeAuditLog } from '@/lib/audit';

/** POST: store manager accepts order (moves to processing/accepted). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role ?? 'user';
  const allowed = ['store_manager', 'admin', 'super_admin'];
  if (!allowed.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: orderId } = await params;
  const storeId = await getOrderStoreId(orderId);
  if (!storeId) {
    return NextResponse.json({ error: 'Order has no store' }, { status: 400 });
  }

  if (role === 'store_manager') {
    const myStoreIds = await getStoreManagerStoreIds(session.user.id);
    if (!myStoreIds.includes(storeId)) {
      return NextResponse.json({ error: 'Not authorized for this store' }, { status: 403 });
    }
  } else {
    const { canAccessStore } = await import('@/lib/access-scope');
    const ok = await canAccessStore(session.user.id, storeId, role);
    if (!ok) {
      return NextResponse.json({ error: 'Not authorized for this store' }, { status: 403 });
    }
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.status !== 'pending' && order.status !== 'processing') {
    return NextResponse.json({ error: 'Order cannot be accepted in current status' }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'accepted', acceptedAt: new Date() },
    include: { items: { include: { product: true } } },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: (session.user as { email?: string }).email ?? undefined,
    action: 'order_accepted',
    entityType: 'order',
    entityId: orderId,
    details: { storeId, previousStatus: order.status },
  });

  return NextResponse.json(updated);
}
