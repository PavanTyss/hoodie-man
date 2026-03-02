import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getOrderStoreId } from '@/lib/access-scope';
import { getStoreManagerStoreIds } from '@/lib/access-scope';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

const bodySchema = z.object({ deliveryAgentId: z.string().min(1) });

/** POST: store manager assigns delivery agent to order. */
export async function POST(
  request: Request,
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const agent = await prisma.user.findUnique({
    where: { id: parsed.data.deliveryAgentId },
    select: { id: true, role: true },
  });
  if (!agent || agent.role !== 'delivery_agent') {
    return NextResponse.json({ error: 'Invalid delivery agent' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  const allowedStatuses = ['accepted', 'assigned_to_delivery', 'yet_to_deliver'];
  if (!allowedStatuses.includes(order.status)) {
    return NextResponse.json({ error: 'Order status does not allow assigning delivery' }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryAgentId: parsed.data.deliveryAgentId,
      deliveryAssignedAt: new Date(),
      status: 'assigned_to_delivery',
    },
    include: {
      items: { include: { product: true } },
      deliveryAgent: { select: { id: true, email: true, name: true } },
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: (session.user as { email?: string }).email ?? undefined,
    action: 'delivery_assigned',
    entityType: 'order',
    entityId: orderId,
    details: { deliveryAgentId: parsed.data.deliveryAgentId },
  });

  return NextResponse.json(updated);
}
