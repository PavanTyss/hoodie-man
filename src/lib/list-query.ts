/**
 * Shared Zod schemas and helpers for list API query params.
 * Use for pagination, sort, search across admin and public list endpoints.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';

/** Parse and validate pagination params; returns safe defaults. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sortOrderSchema = z.enum(['asc', 'desc']);

/** Admin orders list query (max limit 50). */
export const adminOrdersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .extend({
    status: z.string().optional(),
    sortBy: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
    sortOrder: sortOrderSchema.default('desc'),
    q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
  });

/** Admin products list query. */
export const adminProductsQuerySchema = paginationSchema.extend({
  storeId: z.string().optional(),
  lowStock: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  sortBy: z
    .enum(['name', 'price', 'createdAt', 'stock', 'category'])
    .default('createdAt'),
  sortOrder: sortOrderSchema.default('desc'),
  q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
});

/** Admin users list query. */
export const adminUsersQuerySchema = paginationSchema.extend({
  role: z
    .enum(['super_admin', 'admin', 'store_manager', 'delivery_agent', 'user'])
    .optional(),
  sortBy: z.enum(['email', 'name', 'createdAt', 'role']).default('createdAt'),
  sortOrder: sortOrderSchema.default('desc'),
  q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
});

/** Admin stores list query. */
export const adminStoresQuerySchema = paginationSchema.extend({
  sortBy: z.enum(['name', 'slug', 'createdAt']).default('name'),
  sortOrder: sortOrderSchema.default('asc'),
  q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
});

/** Admin audit logs list query. */
export const auditLogsQuerySchema = paginationSchema.extend({
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  actorId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'action', 'entityType']).default('createdAt'),
  sortOrder: sortOrderSchema.default('desc'),
  q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
});

/** Public products list query (default limit 24, max 48). */
export const publicProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(48).default(24),
  })
  .extend({
    category: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
    sortOrder: sortOrderSchema.default('desc'),
    q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
  });

/** Customer orders list query. */
export const customerOrdersQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
  sortBy: z.enum(['createdAt']).default('createdAt'),
  sortOrder: sortOrderSchema.default('desc'),
  q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
});

/** Customer addresses list query. */
export const addressesQuerySchema = z.object({
  sortBy: z.enum(['createdAt', 'label']).default('createdAt'),
  sortOrder: sortOrderSchema.default('asc'),
  q: z.string().optional().transform((s) => (s?.trim() ? s.trim() : undefined)),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  const result = schema.safeParse(obj);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: NextResponse.json(
      { error: 'Invalid query parameters', details: result.error.flatten().fieldErrors },
      { status: 400 }
    ),
  };
}
