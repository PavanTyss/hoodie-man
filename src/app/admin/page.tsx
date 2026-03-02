'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface HomeData {
  role: string;
  userCount?: number;
  storeCount?: number;
  orderCount?: number;
  productCount?: number;
  lowStockCount?: number;
  revenue?: number;
  aov?: number;
  recentOrders?: Array<{ id: string; total?: number; status: string; user?: { name: string; email: string }; createdAt: string }>;
  assignedCount?: number;
  deliveredToday?: number;
  pendingOrders?: Array<{ id: string; status: string; user?: { name: string }; createdAt: string }>;
  storeIds?: string[];
  pendingAccept?: Array<{ id: string; status: string; user?: { name: string }; createdAt: string }>;
  pendingDelivery?: Array<{ id: string; status: string; user?: { name: string }; deliveryAgent?: { name: string }; createdAt: string }>;
}

export default function AdminHomePage() {
  const { data: session } = useSession();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/home')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const role = (session?.user as { role?: string })?.role ?? '';

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Staff Home</h1>
        <p className="text-muted-foreground capitalize">{data?.role?.replace('_', ' ') ?? role.replace('_', ' ')}</p>
      </div>

      {data?.role === 'delivery_agent' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Assigned (pending)</p>
            <p className="text-2xl font-bold text-foreground">{data.assignedCount ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Delivered today</p>
            <p className="text-2xl font-bold text-foreground">{data.deliveredToday ?? 0}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <Link href="/admin/orders" className="flex items-center gap-2 text-primary font-medium">
              View my orders <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {data?.role === 'store_manager' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Orders (my stores)</p>
              <p className="text-2xl font-bold text-foreground">{data.orderCount ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-2xl font-bold text-foreground">{data.productCount ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Low stock (≤10)</p>
              <p className={`text-2xl font-bold ${(data.lowStockCount ?? 0) > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                {data.lowStockCount ?? 0}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-center gap-1">
              <Link href="/admin/orders" className="text-primary font-medium flex items-center gap-1">Orders <ChevronRight className="h-4 w-4" /></Link>
              <Link href="/admin/stores" className="text-primary font-medium flex items-center gap-1">My stores <ChevronRight className="h-4 w-4" /></Link>
              <Link href="/admin/products" className="text-primary font-medium flex items-center gap-1">Products <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </div>
          {(data.revenue != null || data.aov != null) && (
            <div className="grid grid-cols-2 gap-4">
              {data.revenue != null && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Revenue (my stores)</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(data.revenue)}</p>
                </div>
              )}
              {data.aov != null && data.aov > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">AOV</p>
                  <p className="text-xl font-bold text-foreground">{formatPrice(data.aov)}</p>
                </div>
              )}
            </div>
          )}
          {data.pendingAccept && data.pendingAccept.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Pending acceptance</h2>
              </div>
              <ul className="divide-y divide-border">
                {data.pendingAccept.slice(0, 5).map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <span className="font-mono text-sm">#{o.id.slice(0, 8)}</span>
                      <span className="text-sm text-muted-foreground">{o.user?.name ?? '—'}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {(data?.role === 'admin' || data?.role === 'super_admin') && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Users</p>
              <p className="text-2xl font-bold text-foreground">{data.userCount ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Stores</p>
              <p className="text-2xl font-bold text-foreground">{data.storeCount ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-2xl font-bold text-foreground">{data.orderCount ?? 0}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(data.revenue ?? 0)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">AOV</p>
              <p className="text-2xl font-bold text-foreground">{data.aov != null && data.aov > 0 ? formatPrice(data.aov) : '—'}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm text-muted-foreground">Low stock (≤10)</p>
              <p className={`text-2xl font-bold ${(data.lowStockCount ?? 0) > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                {data.lowStockCount ?? 0}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 flex items-center">
              <Link href="/admin/orders" className="text-primary font-medium flex items-center gap-1">
                View orders <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {data.recentOrders && data.recentOrders.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold text-foreground">Recent orders</h2>
              </div>
              <ul className="divide-y divide-border">
                {data.recentOrders.slice(0, 10).map((o) => (
                  <li key={o.id}>
                    <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <span className="font-mono text-sm">#{o.id.slice(0, 8)}</span>
                      <span className="text-sm text-muted-foreground">{o.user?.name ?? o.user?.email ?? '—'}</span>
                      <span className="text-sm font-medium">{o.total != null ? formatPrice(o.total) : ''}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
