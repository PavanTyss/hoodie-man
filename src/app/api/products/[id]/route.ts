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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(parseProduct(product));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
