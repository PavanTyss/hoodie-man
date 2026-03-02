import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, type SessionWithRole } from '@/lib/require-role';
import { getStoreManagerStoreIds } from '@/lib/access-scope';
import { getAdminScopes } from '@/lib/access-scope';
import { canAccessStore } from '@/lib/access-scope';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';
import {
  adminProductsQuerySchema,
  parseSearchParams,
} from '@/lib/list-query';
import { toCsv } from '@/lib/csv-export';
import type { Prisma } from '@prisma/client';

const EXPORT_LIMIT = 5000;

function parseProduct(p: { images: string; sizes: string; colors: string; [k: string]: unknown }) {
  return {
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
  };
}

/** GET: list products with pagination, filter, sort, search. Optional ?format=csv for CSV export. */
export async function GET(request: Request) {
  const result = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (result.error) return result.error;
  const session = result.session as SessionWithRole;
  const role = session.user.role ?? 'user';
  const userId = session.user.id;

  const searchParams = new URL(request.url).searchParams;
  const exportCsv = searchParams.get('format') === 'csv' || searchParams.get('export') === 'csv';
  const parsed = parseSearchParams(searchParams, adminProductsQuerySchema);
  if (!parsed.success) return parsed.error;
  const { storeId, lowStock, sortBy, sortOrder, q } = parsed.data;
  let { page, limit } = parsed.data;
  if (exportCsv) {
    limit = EXPORT_LIMIT;
    page = 1;
  }

  let storeIds: string[] | null = null;
  if (role === 'store_manager') {
    storeIds = await getStoreManagerStoreIds(userId);
    if (storeIds.length === 0) {
      return NextResponse.json({
        items: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      });
    }
    if (storeId && !storeIds.includes(storeId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (role === 'admin') {
    const scopes = await getAdminScopes(userId, role);
    if (scopes.storeIds.length > 0) {
      storeIds = scopes.storeIds;
      if (storeId && !storeIds.includes(storeId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const where: Prisma.ProductWhereInput = {};
  if (storeIds && storeIds.length > 0) {
    where.storeId = storeId ? storeId : { in: storeIds };
  } else if (storeId) {
    where.storeId = storeId;
  }
  if (lowStock) {
    where.stock = { lte: 10 };
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sortBy === 'name'
      ? { name: sortOrder }
      : sortBy === 'price'
        ? { price: sortOrder }
        : sortBy === 'stock'
          ? { stock: sortOrder }
          : sortBy === 'category'
            ? { category: sortOrder }
            : { createdAt: sortOrder };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { store: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  const items = rows.map(parseProduct);

  if (exportCsv) {
    type ProductRow = { id: string; name: string; price: number; stock: number; category: string; createdAt: Date; store?: { name?: string } };
    const csvRows = (items as unknown as ProductRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      category: p.category,
      createdAt: p.createdAt,
      storeName: p.store?.name ?? '',
    }));
    const csv = toCsv(csvRows, [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'price', header: 'Price' },
      { key: 'stock', header: 'Stock' },
      { key: 'category', header: 'Category' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'storeName', header: 'Store' },
    ]);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="products.csv"',
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

const createProductSchema = z.object({
  storeId: z.string().min(1),
  name: z.string().min(1).max(500),
  description: z.string().min(1),
  price: z.number().positive(),
  discount: z.number().min(0).max(100).optional(),
  category: z.string().min(1),
  images: z.union([z.string(), z.array(z.string())]),
  sizes: z.union([z.string(), z.array(z.string())]),
  colors: z.union([z.string(), z.array(z.string())]),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
});

/** POST: create product (store_manager for their store; admin/super_admin with access). */
export async function POST(request: Request) {
  const result = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (result.error) return result.error;
  const session = result.session as SessionWithRole;
  const role = session.user.role ?? 'user';

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const canAccess = await canAccessStore(session.user.id, parsed.data.storeId, role);
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const images =
    typeof parsed.data.images === 'string'
      ? parsed.data.images
      : JSON.stringify(Array.isArray(parsed.data.images) ? parsed.data.images : []);
  const sizes =
    typeof parsed.data.sizes === 'string'
      ? parsed.data.sizes
      : JSON.stringify(Array.isArray(parsed.data.sizes) ? parsed.data.sizes : []);
  const colors =
    typeof parsed.data.colors === 'string'
      ? parsed.data.colors
      : JSON.stringify(Array.isArray(parsed.data.colors) ? parsed.data.colors : []);

  const product = await prisma.product.create({
    data: {
      storeId: parsed.data.storeId,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      discount: parsed.data.discount ?? 0,
      category: parsed.data.category,
      images,
      sizes,
      colors,
      stock: parsed.data.stock,
      featured: parsed.data.featured ?? false,
    },
    include: { store: { select: { id: true, name: true } } },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? undefined,
    action: 'product_created',
    entityType: 'product',
    entityId: product.id,
    details: { name: product.name, storeId: product.storeId },
  });

  return NextResponse.json(parseProduct(product));
}
