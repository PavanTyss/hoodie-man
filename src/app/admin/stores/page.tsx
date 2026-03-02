'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Store as StoreIcon, Plus, Download } from 'lucide-react';
import { downloadCsvFromUrl } from '@/lib/csv-export';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import Button from '@/components/ui/Button';

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number; storeManagers: number };
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'slug', label: 'Slug' },
  { value: 'createdAt', label: 'Date' },
];

export default function AdminStoresPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const sortBy = searchParams.get('sortBy') ?? 'name';
  const sortOrder = (searchParams.get('sortOrder') ?? 'asc') as 'asc' | 'desc';
  const q = searchParams.get('q') ?? '';

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === undefined) p.delete(k);
        else p.set(k, String(v));
      });
      if (p.get('page') === '1') p.delete('page');
      router.replace(`/admin/stores${p.toString() ? `?${p.toString()}` : ''}`);
    },
    [searchParams, router]
  );

  const handleExportCsv = useCallback(() => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set('format', 'csv');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    downloadCsvFromUrl(`/api/admin/stores?${params}`, 'stores.csv').finally(() => setExporting(false));
  }, [sortBy, sortOrder, q]);

  const loadStores = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    fetch(`/api/admin/stores?${params}`)
      .then((res) =>
        res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      )
      .then((data: { items?: StoreRow[]; pagination?: typeof pagination }) => {
        setStores(data.items ?? []);
        setPagination(
          data.pagination ?? { page: 1, limit: 20, total: data.items?.length ?? 0, totalPages: 1 }
        );
      })
      .catch(() => {
        setStores([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [page, sortBy, sortOrder, q]);

  useEffect(() => {
    if (role !== 'super_admin' && role !== 'admin') return;
    loadStores();
  }, [role, loadStores]);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createSlug.trim()) {
      toast.error('Name and slug required');
      return;
    }
    const slug = createSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      toast.error('Invalid slug');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName.trim(), slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create store');
        return;
      }
      toast.success('Store created');
      setShowCreate(false);
      setCreateName('');
      setCreateSlug('');
      loadStores();
    } finally {
      setSubmitting(false);
    }
  };

  if (role !== 'super_admin' && role !== 'admin') {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  const canCreateStore = role === 'super_admin' || role === 'admin';

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Stores</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage stores and assign managers</p>
          </div>
          {canCreateStore && (
          <button
            type="button"
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            <Plus className="h-4 w-4" /> Create store
          </button>
          )}
        </div>
        <FilterBar>
          <div className="min-w-[200px]">
            <SearchInput
              key={q}
              label="Search"
              placeholder="Name, slug…"
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
      {showCreate && canCreateStore && (
        <form onSubmit={handleCreateStore} className="p-6 border-b border-border bg-muted/30 space-y-4">
          <input
            type="text"
            placeholder="Store name"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground"
          />
          <input
            type="text"
            placeholder="Slug (e.g. my-store)"
            value={createSlug}
            onChange={(e) => setCreateSlug(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
              Create
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border">
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No stores yet.</div>
        ) : (
          <>
          <ul className="divide-y divide-border">
            {stores.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/stores/${s.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <StoreIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.slug}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {s._count?.products ?? 0} products · {s._count?.storeManagers ?? 0} managers
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
