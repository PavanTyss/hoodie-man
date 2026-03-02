import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/** GET: customer dashboard home - recent orders, addresses count, wishlist count. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const [orders, addressesCount, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
    }),
    prisma.deliveryAddress.count({ where: { userId } }),
    prisma.wishlist.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    recentOrders: orders,
    addressesCount,
    wishlistCount,
  });
}
