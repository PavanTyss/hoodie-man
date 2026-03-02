import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/require-role';
import { hash } from 'bcryptjs';
import { writeAuditLog } from '@/lib/audit';
import { validatePassword } from '@/lib/validation';
import { z } from 'zod';
import {
  adminUsersQuerySchema,
  parseSearchParams,
} from '@/lib/list-query';
import { toCsv } from '@/lib/csv-export';

const EXPORT_LIMIT = 5000;

const createAdminSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(8),
  role: z.enum(['admin', 'store_manager', 'delivery_agent']),
});

/** GET: list users (super_admin only) with filter, sort, search. Optional ?format=csv for CSV export. */
export async function GET(request: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const searchParams = new URL(request.url).searchParams;
  const exportCsv = searchParams.get('format') === 'csv' || searchParams.get('export') === 'csv';
  const parsed = parseSearchParams(searchParams, adminUsersQuerySchema);
  if (!parsed.success) return parsed.error;
  const { role, sortBy, sortOrder, q } = parsed.data;
  let { page, limit } = parsed.data;
  if (exportCsv) {
    limit = EXPORT_LIMIT;
    page = 1;
  }

  const where: { role?: string; OR?: { email?: object; name?: object }[] } = {};
  if (role) where.role = role;
  if (q) {
    where.OR = [
      { email: { contains: q, mode: 'insensitive' as const } },
      { name: { contains: q, mode: 'insensitive' as const } },
    ];
  }

  const orderBy =
    sortBy === 'email'
      ? { email: sortOrder }
      : sortBy === 'name'
        ? { name: sortOrder }
        : sortBy === 'role'
          ? { role: sortOrder }
          : { createdAt: sortOrder };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  if (exportCsv) {
    const csvRows = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name ?? '',
      role: u.role,
      createdAt: u.createdAt,
      ordersCount: (u as { _count?: { orders: number } })._count?.orders ?? 0,
    }));
    const csv = toCsv(csvRows, [
      { key: 'id', header: 'ID' },
      { key: 'email', header: 'Email' },
      { key: 'name', header: 'Name' },
      { key: 'role', header: 'Role' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'ordersCount', header: 'Orders Count' },
    ]);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="users.csv"',
      },
    });
  }

  return NextResponse.json({
    items: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

/** POST: create admin/store_manager/delivery_agent (super_admin only). */
export async function POST(request: Request) {
  const { session, error } = await requireSuperAdmin();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = createAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { email, name, password, role } = parsed.data;
  const emailLower = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
  }

  const { isValid, errors } = validatePassword(password);
  if (!isValid) {
    return NextResponse.json({ error: errors }, { status: 400 });
  }

  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: emailLower,
      name: name ?? emailLower.split('@')[0],
      password: hashedPassword,
      role,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  await writeAuditLog({
    actorId: session!.user!.id,
    actorEmail: (session!.user as { email?: string }).email ?? undefined,
    action: 'user_created',
    entityType: 'user',
    entityId: user.id,
    details: { role, email: user.email },
  });

  return NextResponse.json(user);
}
