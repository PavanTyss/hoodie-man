import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/orders/[id]
 * Returns a single order with items and product details.
 * Authenticated: only the order owner can view.
 * Guest: could support orderId + email in query (not implemented here for brevity).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Parse JSON fields on product if needed
    const items = order.items.map((item) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            images:
              typeof item.product.images === 'string'
                ? JSON.parse(item.product.images)
                : item.product.images,
            sizes:
              typeof item.product.sizes === 'string'
                ? JSON.parse(item.product.sizes)
                : item.product.sizes,
            colors:
              typeof item.product.colors === 'string'
                ? JSON.parse(item.product.colors)
                : item.product.colors,
          }
        : null,
    }));

    return NextResponse.json({
      id: order.id,
      status: order.status,
      total: order.total,
      discount: order.discount,
      promoCode: order.promoCode,
      trackingNumber: order.trackingNumber,
      shippingAddress:
        typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress,
      createdAt: order.createdAt,
      items,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
