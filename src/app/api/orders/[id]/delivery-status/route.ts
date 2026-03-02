import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

const validStatuses = ['yet_to_deliver', 'out_for_delivery', 'delivered'] as const;
const bodySchema = z.object({
  status: z.enum(validStatuses),
  trackingNumber: z.string().optional(),
});

/** PATCH: delivery agent updates delivery status. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role ?? 'user';
  if (role !== 'delivery_agent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: orderId } = await params;
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

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.deliveryAgentId !== session.user.id) {
    return NextResponse.json({ error: 'Order not assigned to you' }, { status: 403 });
  }

  const data: { status: string; trackingNumber?: string } = { status: parsed.data.status };
  if (parsed.data.trackingNumber != null) data.trackingNumber = parsed.data.trackingNumber;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data,
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: (session.user as { email?: string }).email ?? undefined,
    action: 'delivery_status_updated',
    entityType: 'order',
    entityId: orderId,
    details: { previousStatus: order.status, newStatus: parsed.data.status },
  });

  return NextResponse.json(updated);
}
