'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';

interface ScopeRow {
  id: string;
  scopeType: string;
  scopeValue: string | null;
}

interface StoreOption {
  id: string;
  name: string;
}

export default function UserScopesPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [, setScopes] = useState<ScopeRow[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [categories, setCategories] = useState('');
  const [customersAll, setCustomersAll] = useState(true);
  const [customerIds, setCustomerIds] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadStores = useCallback(() => {
    const params = new URLSearchParams();
    params.set('limit', '100');
    params.set('sortBy', storeSortBy);
    params.set('sortOrder', storeSortOrder);
    if (storeSearch) params.set('q', storeSearch);
    return fetch(`/api/admin/stores?${params}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: StoreOption[] }) => setStores(data?.items ?? []));
  }, [storeSearch, storeSortBy, storeSortOrder]);

  useEffect(() => {
    if (role !== 'super_admin' || !userId) return;
    setLoading(true);
    fetch(`/api/admin/super/users/${userId}/scopes`)
      .then((res) => (res.ok ? res.json() : null))
      .then((scopeData) => {
        if (scopeData?.scopes) {
          setScopes(scopeData.scopes);
          const storeIds = scopeData.scopes.filter((s: ScopeRow) => s.scopeType === 'store' && s.scopeValue).map((s: ScopeRow) => s.scopeValue!);
          setSelectedStoreIds(storeIds);
          const cats = scopeData.scopes.filter((s: ScopeRow) => s.scopeType === 'product_category' && s.scopeValue).map((s: ScopeRow) => s.scopeValue!);
          setCategories(cats.join(', '));
          const cust = scopeData.scopes.find((s: ScopeRow) => s.scopeType === 'customers');
          if (cust) {
            setCustomersAll(cust.scopeValue === 'all');
            try {
              if (cust.scopeValue && cust.scopeValue !== 'all') setCustomerIds(JSON.parse(cust.scopeValue).join(', '));
            } catch {
              setCustomerIds(cust.scopeValue ?? '');
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, userId]);

  useEffect(() => {
    if (role !== 'super_admin' || !userId) return;
    loadStores();
  }, [role, userId, loadStores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role !== 'super_admin') return;
    setSubmitting(true);
    try {
      const scopeItems: { scopeType: string; scopeValue: string | null }[] = [];
      selectedStoreIds.forEach((storeId) => scopeItems.push({ scopeType: 'store', scopeValue: storeId }));
      categories.split(',').map((c) => c.trim()).filter(Boolean).forEach((c) => scopeItems.push({ scopeType: 'product_category', scopeValue: c }));
      if (customersAll) {
        scopeItems.push({ scopeType: 'customers', scopeValue: 'all' });
      } else {
        const ids = customerIds.split(',').map((x) => x.trim()).filter(Boolean);
        scopeItems.push({ scopeType: 'customers', scopeValue: ids.length ? JSON.stringify(ids) : '' });
      }
      const res = await fetch(`/api/admin/super/users/${userId}/scopes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scopes: scopeItems }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to save scopes');
        return;
      }
      toast.success('Scopes updated');
      router.push('/admin/users');
    } finally {
      setSubmitting(false);
    }
  };

  if (role !== 'super_admin') {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
        <h1 className="text-xl font-bold text-foreground mb-2">Assign access (scopes)</h1>
        <p className="text-sm text-muted-foreground mb-6">User ID: {userId}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex flex-wrap items-end gap-4 mb-2">
              <label className="block text-sm font-medium text-foreground">Stores</label>
              <div className="min-w-[180px]">
                <SearchInput
                  key={storeSearch}
                  label="Search stores"
                  placeholder="Name, slug…"
                  defaultValue={storeSearch}
                  onSearch={setStoreSearch}
                />
              </div>
              <SortDropdown
                options={[
                  { value: 'name', label: 'Name' },
                  { value: 'slug', label: 'Slug' },
                  { value: 'createdAt', label: 'Date' },
                ]}
                value={storeSortBy}
                order={storeSortOrder}
                onChange={(by, order) => { setStoreSortBy(by); setStoreSortOrder(order); }}
                label="Sort"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {stores.map((s) => (
                <label key={s.id} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
                  <input
                    type="checkbox"
                    checked={selectedStoreIds.includes(s.id)}
                    onChange={(e) =>
                      setSelectedStoreIds((prev) =>
                        e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                      )
                    }
                  />
                  <span className="text-sm">{s.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Product categories (comma-separated)</label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="hoodies, t-shirts, apparel"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Customers</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" checked={customersAll} onChange={() => setCustomersAll(true)} />
                <span className="text-sm">All customers</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={!customersAll} onChange={() => setCustomersAll(false)} />
                <span className="text-sm">Specific user IDs (comma-separated)</span>
              </label>
              {!customersAll && (
                <input
                  type="text"
                  value={customerIds}
                  onChange={(e) => setCustomerIds(e.target.value)}
                  placeholder="userId1, userId2"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground mt-1"
                />
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save scopes'}
            </button>
            <Link href="/admin/users" className="px-4 py-2 rounded-lg border border-border">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
