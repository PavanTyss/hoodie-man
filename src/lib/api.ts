import { Product } from '@/types/product';

/**
 * Fetches all products from the API (client-side).
 * @throws Error if the request fails
 */
export async function getProducts() {
  const response = await fetch('/api/products', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
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

/**
 * Fetches all products from the database (server-side). Use in RSC or API.
 */
export async function getProductsFromDB() {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return products.map(parseProduct);
}

/** Fetches a single product by ID from the database (server-side). */
export async function getProductByIdFromDB(id: string) {
  const { prisma } = await import('@/lib/prisma');
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product ? parseProduct(product) : null;
}

/** Fetches products by category from the database (server-side). */
export async function getProductsByCategoryFromDB(category: string) {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
  });
  return products.map(parseProduct);
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
