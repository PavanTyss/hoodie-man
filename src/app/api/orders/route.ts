import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
  customerOrdersQuerySchema,
  parseSearchParams,
} from '@/lib/list-query';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerInfo, total } = body;

    const session = await auth();
    let userId = session?.user?.id;

    if (!userId) {
      const guest = await prisma.user.upsert({
        where: { email: 'guest@hoodieman.local' },
        update: { name: 'Guest' },
        create: { email: 'guest@hoodieman.local', name: 'Guest' },
      });
      userId = guest.id;
    }

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: 'pending',
        shippingAddress: JSON.stringify({
          email: customerInfo.email,
          name: `${customerInfo.firstName} ${customerInfo.lastName}`,
          address: customerInfo.address,
        }),
        items: {
          create: items.map((item: { id: string; quantity: number; price: number; selectedSize?: string; selectedColor?: string }) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

/** GET: list current user's orders with pagination, filter, sort, search. */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = parseSearchParams(
      new URL(request.url).searchParams,
      customerOrdersQuerySchema
    );
    if (!parsed.success) return parsed.error;
    const { page, limit, status, sortBy, sortOrder, q } = parsed.data;

    const where: Prisma.OrderWhereInput = { userId: session.user.id };
    if (status) where.status = status;
    if (q?.trim()) {
      where.id = { contains: q.trim(), mode: 'insensitive' };
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput =
      sortBy === 'createdAt' ? { createdAt: sortOrder as 'asc' | 'desc' } : { createdAt: 'desc' };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { include: { product: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      items: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
