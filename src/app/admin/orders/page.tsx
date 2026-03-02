'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, ChevronRight, Download } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { downloadCsvFromUrl } from '@/lib/csv-export';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import Button from '@/components/ui/Button';

interface OrderRow {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { name: string | null; email: string };
  deliveryAgent?: { name: string | null } | null;
  items?: { product?: { storeId: string | null } }[];
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'pending_cancellation', label: 'Pending cancellation' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'assigned_to_delivery', label: 'Assigned to delivery' },
  { value: 'yet_to_deliver', label: 'Yet to deliver' },
  { value: 'out_for_delivery', label: 'Out for delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'total', label: 'Total' },
  { value: 'status', label: 'Status' },
];

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10)));
  const status = searchParams.get('status') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
  const q = searchParams.get('q') ?? '';

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === undefined) p.delete(k);
        else p.set(k, String(v));
      });
      if (p.get('page') === '1') p.delete('page');
      router.replace(`/admin/orders${p.toString() ? `?${p.toString()}` : ''}`);
    },
    [searchParams, router]
  );

  const handleExportCsv = useCallback(() => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set('format', 'csv');
    if (status) params.set('status', status);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    downloadCsvFromUrl(`/api/admin/orders?${params}`, 'orders.csv').finally(() => setExporting(false));
  }, [status, sortBy, sortOrder, q]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (status) params.set('status', status);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    fetch(`/api/admin/orders?${params}`)
      .then((res) => (res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }))
      .then((data) => {
        setOrders(data.items ?? []);
        setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .catch(() => {
        setOrders([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [page, limit, status, sortBy, sortOrder, q]);

  useEffect(() => {
    if (!['super_admin', 'admin', 'store_manager', 'delivery_agent'].includes(role)) return;
    // Data fetch: load() triggers setState in async callbacks (valid pattern)
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [role, load]);

  const statusBadge = (s: string) => {
    const base = 'inline-flex px-2 py-0.5 rounded-full text-xs font-medium ';
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      accepted: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
      assigned_to_delivery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      yet_to_deliver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      out_for_delivery: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      pending_cancellation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return base + (styles[s] ?? 'bg-muted text-muted-foreground');
  };

  if (!['super_admin', 'admin', 'store_manager', 'delivery_agent'].includes(role)) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage orders by role</p>
        <FilterBar className="mt-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => setParams({ status: e.target.value, page: 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm min-w-[180px]"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <SearchInput
              key={q}
              label="Search"
              placeholder="Order ID, customer…"
              defaultValue={q}
              onSearch={(value) => setParams({ q: value, page: 1 })}
            />
          </div>
          <SortDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            order={sortOrder}
            onChange={(by, order) => setParams({ sortBy: by, sortOrder: order })}
          />
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="gap-2">
            <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </FilterBar>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="animate-pulse">Loading…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No orders.</div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-medium text-foreground">
                          #{o.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {o.user?.name ?? o.user?.email ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={statusBadge(o.status)}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                      {o.deliveryAgent && (
                        <span className="text-xs text-muted-foreground">
                          Agent: {o.deliveryAgent.name ?? '—'}
                        </span>
                      )}
                      <span className="font-medium text-foreground">{formatPrice(o.total)}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setParams({ page: pagination.page - 1 })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setParams({ page: pagination.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
