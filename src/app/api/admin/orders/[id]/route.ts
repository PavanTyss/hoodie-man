import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getStoreManagerStoreIds } from '@/lib/access-scope';
import { getOrderStoreId } from '@/lib/access-scope';
import { canAccessStore } from '@/lib/access-scope';

/** GET: single order for staff (store_manager/delivery_agent/admin/super_admin with access). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role ?? 'user';
  const allowed = ['super_admin', 'admin', 'store_manager', 'delivery_agent'];
  if (!allowed.includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: { select: { id: true, name: true, storeId: true } } } },
      user: { select: { id: true, email: true, name: true } },
      deliveryAgent: { select: { id: true, email: true, name: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (role === 'delivery_agent') {
    if (order.deliveryAgentId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(order);
  }

  if (role === 'store_manager') {
    const storeId = await getOrderStoreId(orderId);
    if (!storeId) {
      return NextResponse.json({ error: 'Order has no store' }, { status: 400 });
    }
    const myStoreIds = await getStoreManagerStoreIds(session.user.id);
    if (!myStoreIds.includes(storeId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(order);
  }

  // admin: enforce store scope (super_admin can see any)
  if (role === 'admin') {
    const storeId = await getOrderStoreId(orderId);
    if (storeId) {
      const ok = await canAccessStore(session.user.id, storeId, role);
      if (!ok) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  return NextResponse.json(order);
}
