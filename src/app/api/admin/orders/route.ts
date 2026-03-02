import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { getStoreManagerStoreIds } from '@/lib/access-scope';
import { getAdminScopes } from '@/lib/access-scope';
import {
  adminOrdersQuerySchema,
  parseSearchParams,
} from '@/lib/list-query';
import { toCsv } from '@/lib/csv-export';
import type { Prisma } from '@prisma/client';

const EXPORT_LIMIT = 5000;

/** GET: list orders for staff with pagination, filter, sort, search. Optional ?format=csv for CSV export. */
export async function GET(request: Request) {
  const { session, error } = await requireRole([
    'super_admin',
    'admin',
    'store_manager',
    'delivery_agent',
  ]);
  if (error) return error;

  const searchParams = new URL(request.url).searchParams;
  const exportCsv = searchParams.get('format') === 'csv' || searchParams.get('export') === 'csv';
  const parsed = parseSearchParams(searchParams, adminOrdersQuerySchema);
  if (!parsed.success) return parsed.error;
  const { status, sortBy, sortOrder, q } = parsed.data;
  let { page, limit } = parsed.data;
  if (exportCsv) {
    limit = EXPORT_LIMIT;
    page = 1;
  }

  const role = (session!.user as { role?: string }).role ?? 'user';
  const userId = session!.user!.id!;

  const where: Prisma.OrderWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (q?.trim()) {
    const qLower = q.trim().toLowerCase();
    where.OR = [
      { id: { contains: q.trim(), mode: 'insensitive' } },
      { user: { email: { contains: qLower, mode: 'insensitive' } } },
      { user: { name: { contains: qLower, mode: 'insensitive' } } },
    ];
  }

  if (role === 'delivery_agent') {
    where.deliveryAgentId = userId;
  } else if (role === 'store_manager') {
    const storeIds = await getStoreManagerStoreIds(userId);
    if (storeIds.length === 0) {
      return NextResponse.json({
        items: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      });
    }
    where.items = {
      some: { product: { storeId: { in: storeIds } } },
    };
  } else if (role === 'admin') {
    const scopes = await getAdminScopes(userId, role);
    if (scopes.storeIds.length > 0) {
      where.items = {
        some: { product: { storeId: { in: scopes.storeIds } } },
      };
    }
  }

  const orderBy: Prisma.OrderOrderByWithRelationInput =
    sortBy === 'total'
      ? { total: sortOrder }
      : sortBy === 'status'
        ? { status: sortOrder }
        : { createdAt: sortOrder };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, email: true, name: true } },
        deliveryAgent: { select: { id: true, email: true, name: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  if (exportCsv) {
    const rows = items.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      userEmail: (o.user as { email?: string })?.email ?? '',
      userName: (o.user as { name?: string | null })?.name ?? '',
      deliveryAgent: (o.deliveryAgent as { name?: string | null })?.name ?? '',
    }));
    const csv = toCsv(rows, [
      { key: 'id', header: 'ID' },
      { key: 'status', header: 'Status' },
      { key: 'total', header: 'Total' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'userEmail', header: 'Customer Email' },
      { key: 'userName', header: 'Customer Name' },
      { key: 'deliveryAgent', header: 'Delivery Agent' },
    ]);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="orders.csv"',
      },
    });
  }

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
