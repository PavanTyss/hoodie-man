import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';

/** GET: list users with role delivery_agent (for store_manager/admin to assign). */
export async function GET() {
  const { error } = await requireRole(['super_admin', 'admin', 'store_manager']);
  if (error) return error;

  const users = await prisma.user.findMany({
    where: { role: 'delivery_agent' },
    select: { id: true, email: true, name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(users);
}
