import { Product } from '@/types/product';

/**
 * Fetches products from the API (client-side). Returns paginated shape.
 * @param params optional page, limit, category, q, sortBy, sortOrder
 */
export async function getProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set('page', String(params.page));
  if (params?.limit) search.set('limit', String(params.limit));
  if (params?.category) search.set('category', params.category);
  if (params?.q) search.set('q', params.q);
  if (params?.sortBy) search.set('sortBy', params.sortBy);
  if (params?.sortOrder) search.set('sortOrder', params.sortOrder);
  const url = `/api/products${search.toString() ? `?${search}` : ''}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch products');
  const json = await response.json();
  return json as { items: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
}

/**
 * Fetches a single product by ID (client-side).
 * @returns The product or null if not found
 */
export async function getProductById(id: string) {
  const response = await fetch(`/api/products/${id}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
}

/** Parses Prisma JSON fields (images, sizes, colors) into Product shape. */
function parseProduct(
  product: {
    images?: string | string[];
    sizes?: string | string[];
    colors?: string | string[];
  } & Record<string, unknown>
): Product {
  const p = product as Record<string, unknown>;
  return {
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images as string[]),
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : (p.sizes as string[]),
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : (p.colors as string[]),
  } as Product;
}

/** Default limit for home "All Products" to avoid loading entire table. */
const DEFAULT_HOME_PRODUCTS_LIMIT = 24;

/**
 * Fetches products from the database (server-side). Use in RSC or API.
 * Returns items and total count so UI can show "Load more" without over-fetching.
 */
export async function getProductsFromDB(options?: { limit?: number }) {
  const limit = options?.limit ?? DEFAULT_HOME_PRODUCTS_LIMIT;
  const { prisma } = await import('@/lib/prisma');
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    prisma.product.count(),
  ]);
  return {
    items: products.map(parseProduct),
    total,
  };
}

/** Fetches a single product by ID from the database (server-side). */
export async function getProductByIdFromDB(id: string) {
  const { prisma } = await import('@/lib/prisma');
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product ? parseProduct(product) : null;
}

/** Fetches products by category from the database (server-side). Paginated for category list pages. */
export async function getProductsByCategoryFromDB(
  category: string,
  options?: { limit?: number; page?: number; sortBy?: string; sortOrder?: 'asc' | 'desc' }
) {
  const limit = options?.limit ?? 12;
  const page = options?.page ?? 1;
  const sortBy = options?.sortBy ?? 'createdAt';
  const sortOrder = options?.sortOrder ?? 'desc';
  const { prisma } = await import('@/lib/prisma');
  const orderBy =
    sortBy === 'name'
      ? { name: sortOrder }
      : sortBy === 'price'
        ? { price: sortOrder }
        : { createdAt: sortOrder };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { category },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where: { category } }),
  ]);
  return {
    items: products.map(parseProduct),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/** Fetches featured products from the database (server-side). */
export async function getFeaturedProductsFromDB() {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
  });
  return products.map(parseProduct);
}
