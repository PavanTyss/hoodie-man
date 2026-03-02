import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-role';
import { writeAuditLog } from '@/lib/audit';
import { z } from 'zod';

const scopeItemSchema = z.object({
  scopeType: z.enum(['store', 'product_category', 'customers']),
  scopeValue: z.string().nullable(),
});

const setScopesSchema = z.object({
  scopes: z.array(scopeItemSchema),
});

/** GET: list admin scopes for user (super_admin only). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'User not found or is not an admin' }, { status: 404 });
  }

  const rows = await prisma.adminScope.findMany({
    where: { userId },
    orderBy: [{ scopeType: 'asc' }, { scopeValue: 'asc' }],
  });

  const scopes = rows.map((r) => ({
    id: r.id,
    scopeType: r.scopeType,
    scopeValue: r.scopeValue,
  }));

  return NextResponse.json({ userId, scopes });
}

/** PUT: replace admin scopes (super_admin only). */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  const { id: userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'User not found or is not an admin' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = setScopesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.adminScope.deleteMany({ where: { userId } });
    if (parsed.data.scopes.length > 0) {
      await tx.adminScope.createMany({
        data: parsed.data.scopes.map((s) => ({
          userId,
          scopeType: s.scopeType,
          scopeValue: s.scopeValue ?? '',
        })),
        skipDuplicates: true,
      });
    }
  });

  const rows = await prisma.adminScope.findMany({
    where: { userId },
    orderBy: [{ scopeType: 'asc' }, { scopeValue: 'asc' }],
  });

  await writeAuditLog({
    actorId: session!.user!.id,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'scopes_updated',
    entityType: 'user',
    entityId: userId,
    details: { scopeCount: rows.length },
  });

  return NextResponse.json({
    userId,
    scopes: rows.map((r) => ({ id: r.id, scopeType: r.scopeType, scopeValue: r.scopeValue })),
  });
}
