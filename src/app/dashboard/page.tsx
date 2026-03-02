'use client';

import { useEffect, useState, useCallback } from 'react';
import { ShoppingBag, ChevronRight, Heart, MapPin, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { formatPrice } from '@/lib/format';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { id: string }[];
  trackingNumber?: string | null;
}

interface HomeData {
  recentOrders: Order[];
  addressesCount: number;
  wishlistCount: number;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  accepted: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  assigned_to_delivery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  yet_to_deliver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  out_for_delivery: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  pending_cancellation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [{ value: 'createdAt', label: 'Date' }];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPagination, setOrderPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderSortOrder, setOrderSortOrder] = useState<'asc' | 'desc'>('desc');
  const [orderSearch, setOrderSearch] = useState('');
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect -- mount guard
  }, []);

  const loadOrders = useCallback(() => {
    setOrdersLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(orderPage));
    params.set('limit', '10');
    if (orderStatus) params.set('status', orderStatus);
    params.set('sortBy', 'createdAt');
    params.set('sortOrder', orderSortOrder);
    if (orderSearch) params.set('q', orderSearch);
    fetch(`/api/orders?${params}`)
      .then((res) => (res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }))
      .then((data) => {
        setOrders(Array.isArray(data) ? data : data?.items ?? []);
        setOrderPagination(data?.pagination ?? { page: 1, limit: 10, total: data?.items?.length ?? 0, totalPages: 1 });
      })
      .catch(() => {
        setOrders([]);
        setOrderPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
      })
      .finally(() => setOrdersLoading(false));
  }, [orderPage, orderStatus, orderSortOrder, orderSearch]);

  useEffect(() => {
    loadOrders(); // eslint-disable-line react-hooks/set-state-in-effect -- data fetch
  }, [loadOrders]);

  useEffect(() => {
    fetch('/api/dashboard/home')
      .then((res) => (res.ok ? res.json() : null))
      .then(setHomeData)
      .catch(() => setHomeData(null))
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status: string) =>
    statusStyles[status] ?? 'bg-muted text-muted-foreground';

  return (
    <div className="space-y-8">
      {/* Home summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/dashboard#orders" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Orders</p>
              <p className="text-lg font-bold text-foreground">
                {orderPagination.total > 0 ? orderPagination.total : orders.length}
              </p>
            </div>
          </div>
        </Link>
        <Link href="/wishlist" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wishlist</p>
              <p className="text-lg font-bold text-foreground">{homeData?.wishlistCount ?? 0}</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/addresses" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Addresses</p>
              <p className="text-lg font-bold text-foreground">{homeData?.addressesCount ?? 0}</p>
            </div>
          </div>
        </Link>
        <Link href="/cart" className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cart</p>
              <p className="text-lg font-bold text-foreground">View</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent orders with tracking (from home API) */}
      {homeData?.recentOrders && homeData.recentOrders.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent orders</h2>
            <Link href="#orders" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border">
            {homeData.recentOrders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted/30"
                >
                  <div>
                    <span className="font-mono text-sm font-medium text-foreground">#{order.id.slice(0, 8)}</span>
                    <span className={`ml-2 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    {order.trackingNumber && (
                      <span className="ml-2 text-xs text-muted-foreground">Tracking: {order.trackingNumber}</span>
                    )}
                  </div>
                  <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full order history */}
      <div id="orders" className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Order History</h1>
          <p className="mt-1 text-muted-foreground">
            View and track your orders
          </p>
          <FilterBar className="mt-4 flex-wrap gap-4">
            <div>
              <label htmlFor="order-status" className="block text-sm font-medium text-foreground mb-1">
                Status
              </label>
              <select
                id="order-status"
                value={orderStatus}
                onChange={(e) => { setOrderStatus(e.target.value); setOrderPage(1); }}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm min-w-[140px]"
                aria-label="Filter by status"
              >
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[180px]">
              <SearchInput
                key={orderSearch}
                label="Search"
                placeholder="Order ID…"
                defaultValue={orderSearch}
                onSearch={(value) => { setOrderSearch(value); setOrderPage(1); }}
              />
            </div>
            <SortDropdown
              options={SORT_OPTIONS}
              value="createdAt"
              order={orderSortOrder}
              onChange={(_by, order) => setOrderSortOrder(order)}
            />
          </FilterBar>
        </div>

      <div className="p-6 sm:p-8">
        {ordersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              When you place an order, it will show up here.
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-background/50 hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {mounted
                        ? new Date(order.createdAt).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })
                        : '—'}
                      {' · '}
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(order.total)}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {orderPagination.totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={orderPagination.page <= 1}
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {orderPagination.page} of {orderPagination.totalPages} ({orderPagination.total} total)
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={orderPagination.page >= orderPagination.totalPages}
                onClick={() => setOrderPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
          </>
        )}
      </div>
      </div>
    </div>
  );
}
