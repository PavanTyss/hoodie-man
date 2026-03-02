import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, type SessionWithRole } from '@/lib/require-role';
import { getStoreManagerStoreIds } from '@/lib/access-scope';
import { getAdminScopes } from '@/lib/access-scope';

/** GET: staff dashboard home - KPIs and activity by role. */
export async function GET() {
  const result = await requireRole(['super_admin', 'admin', 'store_manager', 'delivery_agent']);
  if (result.error) return result.error;
  const session = result.session as SessionWithRole;

  const role = session.user.role ?? 'user';
  const userId = session.user.id;

  if (role === 'delivery_agent') {
    const [assignedCount, deliveredToday, pending] = await Promise.all([
      prisma.order.count({ where: { deliveryAgentId: userId, status: { not: 'delivered' } } }),
      prisma.order.count({
        where: {
          deliveryAgentId: userId,
          status: 'delivered',
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.findMany({
        where: { deliveryAgentId: userId, status: { in: ['assigned_to_delivery', 'yet_to_deliver', 'out_for_delivery'] } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true } }, items: { take: 1 } },
      }),
    ]);
    return NextResponse.json({
      role: 'delivery_agent',
      assignedCount,
      deliveredToday,
      pendingOrders: pending,
    });
  }

  if (role === 'store_manager') {
    const storeIds = await getStoreManagerStoreIds(userId);
      const orderWhereStore =
      storeIds.length > 0
        ? {
            items: { some: { product: { storeId: { in: storeIds } } } },
            status: { notIn: ['cancelled', 'pending_cancellation'] as string[] },
          }
        : null;
    const [orderCount, productCount, lowStockCount, revenueResult, pendingAccept, pendingDelivery] = await Promise.all([
      storeIds.length > 0
        ? prisma.order.count({
            where: {
              items: {
                some: {
                  product: { storeId: { in: storeIds } },
                },
              },
            },
          })
        : 0,
      storeIds.length > 0 ? prisma.product.count({ where: { storeId: { in: storeIds } } }) : 0,
      storeIds.length > 0 ? prisma.product.count({ where: { storeId: { in: storeIds }, stock: { lte: 10 } } }) : 0,
      orderWhereStore
        ? prisma.order.aggregate({
            where: orderWhereStore,
            _sum: { total: true },
            _count: true,
          })
        : { _sum: { total: null as number | null }, _count: 0 },
      storeIds.length > 0
        ? prisma.order.findMany({
            where: {
              status: { in: ['pending', 'processing'] },
              items: {
                some: { product: { storeId: { in: storeIds } } },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
          })
        : [],
      storeIds.length > 0
        ? prisma.order.findMany({
            where: {
              status: { in: ['accepted', 'assigned_to_delivery', 'yet_to_deliver', 'out_for_delivery'] },
              items: {
                some: { product: { storeId: { in: storeIds } } },
              },
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true } }, deliveryAgent: { select: { name: true } }, items: { take: 1 } },
          })
        : [],
    ]);
    const revenue = revenueResult._sum?.total ?? 0;
    const paidCount = revenueResult._count ?? 0;
    const aov = paidCount > 0 ? revenue / paidCount : 0;
    return NextResponse.json({
      role: 'store_manager',
      storeIds,
      orderCount,
      productCount,
      lowStockCount,
      revenue,
      aov,
      pendingAccept,
      pendingDelivery,
    });
  }

  const scopes = await getAdminScopes(userId, role);
  const isAdmin = role === 'admin';
  const orderWhereAggregate =
    isAdmin && scopes.storeIds.length > 0
      ? {
          items: { some: { product: { storeId: { in: scopes.storeIds } } } },
          status: { notIn: ['cancelled', 'pending_cancellation'] as string[] },
        }
      : { status: { notIn: ['cancelled', 'pending_cancellation'] as string[] } };

  const [userCount, storeCount, orderCount, recentOrders, revenueResult, lowStockCount] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true, email: true } }, items: { take: 1 } },
    }),
    prisma.order.aggregate({
      where: orderWhereAggregate,
      _sum: { total: true },
      _count: true,
    }),
    prisma.product.count({ where: { stock: { lte: 10 } } }),
  ]);

  const revenue = revenueResult._sum?.total ?? 0;
  const paidCount = revenueResult._count ?? 0;
  const aov = paidCount > 0 ? revenue / paidCount : 0;

  return NextResponse.json({
    role,
    userCount,
    storeCount,
    orderCount,
    recentOrders,
    revenue,
    aov,
    lowStockCount,
  });
}
