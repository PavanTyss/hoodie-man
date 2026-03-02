import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/require-role';

/** GET: list users with role store_manager or delivery_agent (for assigning to stores). Admin/super_admin only. */
export async function GET() {
  const { error } = await requireRole(['super_admin', 'admin']);
  if (error) return error;

  const users = await prisma.user.findMany({
    where: { role: { in: ['store_manager', 'delivery_agent'] } },
    select: { id: true, email: true, name: true, role: true },
    orderBy: [{ name: 'asc' }, { email: 'asc' }],
  });

  return NextResponse.json(users);
}
