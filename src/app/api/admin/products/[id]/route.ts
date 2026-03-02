import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, type SessionWithRole } from '@/lib/require-role';
import { canAccessStore } from '@/lib/access-scope';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

function parseProduct(p: { images: string; sizes: string; colors: string; [k: string]: unknown }) {
  return {
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
  };
}

/** GET: single product for staff (with store access). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (result.error) return result.error;
  const session = result.session as SessionWithRole;
  const role = session.user.role ?? 'user';

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: { select: { id: true, name: true, slug: true } } },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (product.storeId) {
    const canAccess = await canAccessStore(session.user.id, product.storeId, role);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (role === 'store_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(parseProduct(product));
}

const updateProductSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  discount: z.number().min(0).max(100).optional(),
  category: z.string().min(1).optional(),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  sizes: z.union([z.string(), z.array(z.string())]).optional(),
  colors: z.union([z.string(), z.array(z.string())]).optional(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
});

/** PATCH: update product (must have store access). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (result.error) return result.error;
  const session = result.session as SessionWithRole;
  const role = session.user.role ?? 'user';

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (existing.storeId) {
    const canAccess = await canAccessStore(session.user.id, existing.storeId, role);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (role === 'store_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.images !== undefined) {
    data.images =
      typeof parsed.data.images === 'string'
        ? parsed.data.images
        : JSON.stringify(Array.isArray(parsed.data.images) ? parsed.data.images : []);
  }
  if (parsed.data.sizes !== undefined) {
    data.sizes =
      typeof parsed.data.sizes === 'string'
        ? parsed.data.sizes
        : JSON.stringify(Array.isArray(parsed.data.sizes) ? parsed.data.sizes : []);
  }
  if (parsed.data.colors !== undefined) {
    data.colors =
      typeof parsed.data.colors === 'string'
        ? parsed.data.colors
        : JSON.stringify(Array.isArray(parsed.data.colors) ? parsed.data.colors : []);
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { store: { select: { id: true, name: true } } },
  });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? undefined,
    action: 'product_updated',
    entityType: 'product',
    entityId: product.id,
    details: { name: product.name },
  });

  return NextResponse.json(parseProduct(product));
}

/** DELETE: delete product (must have store access). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (result.error) return result.error;
  const session = result.session as SessionWithRole;
  const role = session.user.role ?? 'user';

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  if (existing.storeId) {
    const canAccess = await canAccessStore(session.user.id, existing.storeId, role);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (role === 'store_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.product.delete({ where: { id } });

  await writeAuditLog({
    actorId: session.user.id,
    actorEmail: session.user.email ?? undefined,
    action: 'product_deleted',
    entityType: 'product',
    entityId: id,
    details: { name: existing.name },
  });

  return NextResponse.json({ success: true });
}
