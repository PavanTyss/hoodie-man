import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  publicProductsQuerySchema,
  parseSearchParams,
} from '@/lib/list-query';
import { publicReadRateLimiter } from '@/lib/rateLimit';
import type { Prisma } from '@prisma/client';

function parseProduct(product: {
  images: string;
  sizes: string;
  colors: string;
  [k: string]: unknown;
}) {
  return {
    ...product,
    images:
      typeof product.images === 'string'
        ? JSON.parse(product.images)
        : product.images,
    sizes:
      typeof product.sizes === 'string'
        ? JSON.parse(product.sizes)
        : product.sizes,
    colors:
      typeof product.colors === 'string'
        ? JSON.parse(product.colors)
        : product.colors,
  };
}

/** GET: list products (public) with category, search, sort, pagination. Rate limited. */
export async function GET(request: NextRequest) {
  const rateLimitResult = publicReadRateLimiter(request);
  if (rateLimitResult) {
    return rateLimitResult;
  }

  const parsed = parseSearchParams(
    new URL(request.url).searchParams,
    publicProductsQuerySchema
  );
  if (!parsed.success) return parsed.error;
  const { page, limit, category, sortBy, sortOrder, q } = parsed.data;

  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sortBy === 'name'
      ? { name: sortOrder }
      : sortBy === 'price'
        ? { price: sortOrder }
        : { createdAt: sortOrder };

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    items: rows.map(parseProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
