import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/products/[id]/reviews
 * Returns reviews for a product (with user name if needed).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: productId } = await params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        helpful: r.helpful,
        createdAt: r.createdAt,
        userName: r.user.name ?? 'Anonymous',
      }))
    );
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

/**
 * POST /api/products/[id]/reviews
 * Body: { rating: number, title?: string, comment: string }
 * Creates a review and updates Product.rating / Product.reviewCount.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;
    const body = await request.json();
    const { rating, title, comment } = body;

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1–5' }, { status: 400 });
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.review.findUnique({
        where: { productId_userId: { productId, userId } },
      });
      if (existing) {
        throw new Error('You have already reviewed this product');
      }

      await tx.review.create({
        data: {
          productId,
          userId,
          rating,
          title: typeof title === 'string' ? title.trim() : undefined,
          comment: comment.trim(),
        },
      });

      const reviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await tx.product.update({
        where: { id: productId },
        data: { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    const status = message.includes('already reviewed') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
