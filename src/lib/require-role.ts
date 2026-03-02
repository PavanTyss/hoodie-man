import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { Role } from '@/lib/access-scope';

export type AllowedRoles = Role | Role[];

export interface SessionWithRole {
  user: { id: string; email?: string; name?: string; role?: string };
}

/** Require auth and one of the given roles. Returns session or a NextResponse error. */
export async function requireRole(
  allowed: AllowedRoles
): Promise<{ session: SessionWithRole; error: null } | { session: null; error: NextResponse }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const role = (session.user as { role?: string }).role ?? 'user';
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedList.includes(role as Role)) {
    return { session: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session: session as SessionWithRole, error: null };
}

/** Require super_admin only. */
export async function requireSuperAdmin() {
  return requireRole('super_admin');
}

/** Require admin or super_admin. */
export async function requireAdmin() {
  return requireRole(['super_admin', 'admin']);
}
