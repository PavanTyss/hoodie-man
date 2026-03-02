'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Plus, ChevronRight, Download } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { downloadCsvFromUrl } from '@/lib/csv-export';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import Button from '@/components/ui/Button';

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  store?: { id: string; name: string };
}

interface StoreOption {
  id: string;
  name: string;
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'stock', label: 'Stock' },
  { value: 'category', label: 'Category' },
];

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10)));
  const storeId = searchParams.get('storeId') ?? '';
  const lowStock = searchParams.get('lowStock') === 'true';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
  const q = searchParams.get('q') ?? '';

  const setParams = useCallback(
    (updates: Record<string, string | number | boolean>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === undefined || v === false) p.delete(k);
        else p.set(k, String(v));
      });
      if (p.get('page') === '1') p.delete('page');
      router.replace(`/admin/products${p.toString() ? `?${p.toString()}` : ''}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    if (!['super_admin', 'admin', 'store_manager'].includes(role)) return;
    fetch('/api/admin/stores')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: StoreOption[] } | StoreOption[]) =>
        setStores(Array.isArray(data) ? data : (data?.items ?? []))
      )
      .catch(() => setStores([]));
  }, [role]);

  const handleExportCsv = useCallback(() => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set('format', 'csv');
    if (storeId) params.set('storeId', storeId);
    if (lowStock) params.set('lowStock', 'true');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    downloadCsvFromUrl(`/api/admin/products?${params}`, 'products.csv').finally(() => setExporting(false));
  }, [storeId, lowStock, sortBy, sortOrder, q]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (storeId) params.set('storeId', storeId);
    if (lowStock) params.set('lowStock', 'true');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    fetch(`/api/admin/products?${params}`)
      .then((res) =>
        res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      )
      .then((data) => {
        setProducts(data.items ?? []);
        setPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .catch(() => {
        setProducts([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [page, limit, storeId, lowStock, sortBy, sortOrder, q]);

  useEffect(() => {
    if (!['super_admin', 'admin', 'store_manager'].includes(role)) return;
    // Data fetch: load() triggers setState in async callbacks (valid pattern)
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [role, load]);

  if (!['super_admin', 'admin', 'store_manager'].includes(role)) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>
      <div className="p-4 border-b border-border">
        <FilterBar className="flex-wrap gap-4">
          {stores.length > 1 && (
            <div>
              <label htmlFor="store-filter" className="block text-sm font-medium text-foreground mb-1">
                Store
              </label>
              <select
                id="store-filter"
                value={storeId}
                onChange={(e) => setParams({ storeId: e.target.value, page: 1 })}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground min-w-[160px]"
                aria-label="Filter by store"
              >
                <option value="">All stores</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={lowStock}
                onChange={(e) => setParams({ lowStock: e.target.checked, page: 1 })}
                className="rounded border-border"
                aria-label="Low stock only"
              />
              Low stock (≤10)
            </label>
          </div>
          <div className="min-w-[200px]">
            <SearchInput
              key={q}
              label="Search"
              placeholder="Name, category…"
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
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No products.</div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Box className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {p.category} {p.store && `· ${p.store.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{formatPrice(p.price)}</span>
                      <span
                        className={`text-sm ${
                          p.stock <= 10 ? 'text-amber-600' : 'text-muted-foreground'
                        }`}
                      >
                        Stock: {p.stock}
                      </span>
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
