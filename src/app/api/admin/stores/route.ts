import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';
import { getAdminScopes, getStoreManagerStoreIds } from '@/lib/access-scope';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';
import {
  adminStoresQuerySchema,
  parseSearchParams,
} from '@/lib/list-query';
import { toCsv } from '@/lib/csv-export';
import type { Prisma } from '@prisma/client';

const EXPORT_LIMIT = 5000;

const createStoreSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

/** GET: list stores with pagination, sort, search. Optional ?format=csv for CSV export. */
export async function GET(request: Request) {
  const { session, error } = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (error) return error;

  const searchParams = new URL(request.url).searchParams;
  const exportCsv = searchParams.get('format') === 'csv' || searchParams.get('export') === 'csv';
  const parsed = parseSearchParams(searchParams, adminStoresQuerySchema);
  if (!parsed.success) return parsed.error;
  const { sortBy, sortOrder, q } = parsed.data;
  let { page, limit } = parsed.data;
  if (exportCsv) {
    limit = EXPORT_LIMIT;
    page = 1;
  }

  const role = (session!.user as { role?: string }).role ?? 'user';
  const userId = session!.user!.id!;

  const where: Prisma.StoreWhereInput = {};

  if (role === 'store_manager') {
    const storeIds = await getStoreManagerStoreIds(userId);
    if (storeIds.length === 0) {
      return NextResponse.json({
        items: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      });
    }
    where.id = { in: storeIds };
  } else if (role === 'admin') {
    const scopes = await getAdminScopes(userId, role);
    if (scopes.storeIds.length > 0) {
      where.id = { in: scopes.storeIds };
    } else {
      where.createdById = userId;
    }
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.StoreOrderByWithRelationInput =
    sortBy === 'slug'
      ? { slug: sortOrder }
      : sortBy === 'createdAt'
        ? { createdAt: sortOrder }
        : { name: sortOrder };

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        createdBy: { select: { id: true, email: true, name: true } },
        _count: { select: { products: true, storeManagers: true } },
      },
    }),
    prisma.store.count({ where }),
  ]);

  if (exportCsv) {
    const csvRows = stores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      createdAt: s.createdAt,
      createdByEmail: (s.createdBy as { email?: string })?.email ?? '',
      productsCount: (s._count as { products?: number })?.products ?? 0,
      managersCount: (s._count as { storeManagers?: number })?.storeManagers ?? 0,
    }));
    const csv = toCsv(csvRows, [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'slug', header: 'Slug' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'createdByEmail', header: 'Created By' },
      { key: 'productsCount', header: 'Products' },
      { key: 'managersCount', header: 'Managers' },
    ]);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="stores.csv"',
      },
    });
  }

  return NextResponse.json({
    items: stores,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/** POST: create store (admin/super_admin). */
export async function POST(request: Request) {
  const { session, error } = await requireRole(['super_admin', 'admin']);
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existing = await prisma.store.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: 'Store with this slug already exists' }, { status: 409 });
  }

  const store = await prisma.store.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      createdById: session!.user!.id!,
    },
    include: {
      createdBy: { select: { id: true, email: true, name: true } },
    },
  });

  await writeAuditLog({
    actorId: session!.user!.id,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'store_created',
    entityType: 'store',
    entityId: store.id,
    details: { name: store.name, slug: store.slug },
  });

  return NextResponse.json(store);
}
