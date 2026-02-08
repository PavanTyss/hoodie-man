import { Product } from '@/types/product';

// For client-side use
export async function getProducts() {
  const response = await fetch('/api/products', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function getProductById(id: string) {
  const response = await fetch(`/api/products/${id}`, { cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
}

// Helper function to parse JSON fields in products
function parseProduct(product: any): Product {
  return {
    ...product,
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
    colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
  };
}

// Server-side functions for direct database access
export async function getProductsFromDB() {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return products.map(parseProduct);
}

export async function getProductByIdFromDB(id: string) {
  const { prisma } = await import('@/lib/prisma');
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product ? parseProduct(product) : null;
}

export async function getProductsByCategoryFromDB(category: string) {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
  });
  return products.map(parseProduct);
}

export async function getFeaturedProductsFromDB() {
  const { prisma } = await import('@/lib/prisma');
  const products = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: 'desc' },
  });
  return products.map(parseProduct);
}
