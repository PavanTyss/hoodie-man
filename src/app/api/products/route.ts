import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function parseProduct(product: any) {
  return {
    ...product,
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
    colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
  };
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products.map(parseProduct));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
