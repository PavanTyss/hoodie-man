import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { requireRole } from '@/lib/require-role';
import { z } from 'zod';

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional().nullable(),
  comment: z.string().min(1).optional(),
});

/** Recompute product rating and reviewCount from its reviews. */
async function updateProductReviewStats(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round(avg * 10) / 10, reviewCount: count },
  });
}

/**
 * PATCH /api/reviews/[id]
 * Customer can edit own review; body: { rating?, title?, comment? }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: reviewId } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, productId: true },
  });
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const staffResult = await requireRole(['super_admin', 'admin', 'store_manager']);
  const isStaff = !staffResult.error;
  if (review.userId !== userId && !isStaff) {
    return NextResponse.json({ error: 'You can only edit your own review' }, { status: 403 });
  }

  const data: { rating?: number; title?: string | null; comment?: string } = {};
  if (parsed.data.rating != null) data.rating = parsed.data.rating;
  if (parsed.data.title !== undefined) data.title = parsed.data.title ?? null;
  if (parsed.data.comment != null) data.comment = parsed.data.comment.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  await prisma.review.update({
    where: { id: reviewId },
    data,
  });
  await updateProductReviewStats(review.productId);

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/reviews/[id]
 * Customer can delete own review; admin/super_admin can delete any (moderation).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: reviewId } = await params;
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, productId: true },
  });
  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  const staffResult = await requireRole(['super_admin', 'admin', 'store_manager']);
  const isStaff = !staffResult.error;
  if (review.userId !== userId && !isStaff) {
    return NextResponse.json({ error: 'You can only delete your own review' }, { status: 403 });
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await updateProductReviewStats(review.productId);

  return NextResponse.json({ success: true });
}
