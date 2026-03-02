import { prisma } from '@/lib/prisma';

export type Role = 'super_admin' | 'admin' | 'store_manager' | 'delivery_agent' | 'user';

export function normalizeRole(role: string | undefined): Role {
  if (!role) return 'user';
  return role as Role;
}

export interface AdminScopes {
  storeIds: string[];
  productCategories: string[];
  customers: 'all' | string[]; // userIds
}

/** Get admin scopes for an admin user. Returns empty scope if not admin/super_admin. */
export async function getAdminScopes(userId: string, role: string): Promise<AdminScopes> {
  const r = normalizeRole(role);
  if (r === 'super_admin') {
    return { storeIds: [], productCategories: [], customers: 'all' };
  }
  if (r !== 'admin') {
    return { storeIds: [], productCategories: [], customers: 'all' };
  }

  const rows = await prisma.adminScope.findMany({
    where: { userId },
  });

  const storeIds: string[] = [];
  const productCategories: string[] = [];
  let customers: 'all' | string[] = 'all';

  for (const row of rows) {
    if (row.scopeType === 'store' && row.scopeValue) storeIds.push(row.scopeValue);
    if (row.scopeType === 'product_category' && row.scopeValue) productCategories.push(row.scopeValue);
    if (row.scopeType === 'customers') {
      if (row.scopeValue === 'all') customers = 'all';
      else if (row.scopeValue != null) {
        try {
          const arr = JSON.parse(row.scopeValue) as string[];
          if (Array.isArray(arr)) customers = arr;
        } catch {
          // ignore
        }
      }
    }
  }

  return { storeIds, productCategories, customers };
}

/** Get store IDs that a store_manager is assigned to. */
export async function getStoreManagerStoreIds(userId: string): Promise<string[]> {
  const rows = await prisma.storeManager.findMany({
    where: { userId },
    select: { storeId: true },
  });
  return rows.map((r) => r.storeId);
}

/** Check if actor can access this store (super_admin, admin with store in scope, or store_manager assigned to store). */
export async function canAccessStore(
  actorId: string,
  storeId: string,
  role: string
): Promise<boolean> {
  const r = normalizeRole(role);
  if (r === 'super_admin') return true;
  if (r === 'admin') {
    const scopes = await getAdminScopes(actorId, role);
    if (scopes.storeIds.length === 0) return true; // no store scope = all stores for admin
    return scopes.storeIds.includes(storeId);
  }
  if (r === 'store_manager') {
    const ids = await getStoreManagerStoreIds(actorId);
    return ids.includes(storeId);
  }
  return false;
}

/** Check if actor can access this product category (super_admin, or admin with category in scope). */
export async function canAccessProductCategory(
  actorId: string,
  category: string,
  role: string
): Promise<boolean> {
  const r = normalizeRole(role);
  if (r === 'super_admin') return true;
  if (r === 'admin') {
    const scopes = await getAdminScopes(actorId, role);
    if (scopes.productCategories.length === 0) return true;
    return scopes.productCategories.includes(category);
  }
  return false;
}

/** Check if actor can access this customer (target userId). Super_admin yes; admin if customers is 'all' or target in list. */
export async function canAccessCustomer(
  actorId: string,
  targetUserId: string,
  role: string
): Promise<boolean> {
  const r = normalizeRole(role);
  if (r === 'super_admin') return true;
  if (r === 'admin') {
    const scopes = await getAdminScopes(actorId, role);
    if (scopes.customers === 'all') return true;
    return scopes.customers.includes(targetUserId);
  }
  return false;
}

/** Get store ID for an order (from first item's product). */
export async function getOrderStoreId(orderId: string): Promise<string | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { select: { storeId: true } } },
        take: 1,
      },
    },
  });
  const item = order?.items?.[0];
  return item?.product?.storeId ?? null;
}
