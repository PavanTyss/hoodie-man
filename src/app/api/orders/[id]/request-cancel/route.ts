import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

const bodySchema = z.object({ reason: z.string().min(1).max(500) });

/** POST: customer requests order cancellation. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allowed = ['pending', 'processing', 'accepted'];
  if (!allowed.includes(order.status)) {
    return NextResponse.json({ error: 'Order cannot be cancelled in current status' }, { status: 400 });
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

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'pending_cancellation',
      cancellationReason: parsed.data.reason,
    },
    include: { items: { include: { product: true } } },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: (session.user as { email?: string }).email ?? undefined,
    action: 'order_cancel_requested',
    entityType: 'order',
    entityId: orderId,
    details: { reason: parsed.data.reason },
  });

  return NextResponse.json(updated);
}
