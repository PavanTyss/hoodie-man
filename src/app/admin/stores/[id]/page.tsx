'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Store as StoreIcon, Plus, Box, UserMinus } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import Button from '@/components/ui/Button';

interface StoreDetail {
  id: string;
  name: string;
  slug: string;
  storeManagers: Array<{ id: string; user: { id: string; email: string; name: string | null; role: string } }>;
  _count?: { products: number };
}

interface ProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function AdminStoreDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editing, setEditing] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<{ id: string; name: string | null; email: string; role: string }[]>([]);
  const [addUserId, setAddUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const id = params?.id as string;
  const canEditStore = role === 'super_admin' || role === 'admin';

  const [productsPage, setProductsPage] = useState(1);
  const [productsSortBy, setProductsSortBy] = useState('createdAt');
  const [productsSortOrder, setProductsSortOrder] = useState<'asc' | 'desc'>('desc');
  const [productsQ, setProductsQ] = useState('');
  const [productsPagination, setProductsPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [productsLoading, setProductsLoading] = useState(false);

  const loadStore = useCallback(() => {
    if (!id) return;
    fetch(`/api/admin/stores/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((s) => {
        if (s) {
          setStore(s);
          setEditName(s.name);
          setEditSlug(s.slug);
        }
      });
  }, [id]);

  const loadProducts = useCallback(() => {
    if (!id) return;
    setProductsLoading(true);
    const params = new URLSearchParams();
    params.set('storeId', id);
    params.set('page', String(productsPage));
    params.set('limit', '20');
    params.set('sortBy', productsSortBy);
    params.set('sortOrder', productsSortOrder);
    if (productsQ) params.set('q', productsQ);
    fetch(`/api/admin/products?${params}`)
      .then((res) => (res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }))
      .then((data) => {
        setProducts(data.items ?? []);
        setProductsPagination(data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .catch(() => {
        setProducts([]);
        setProductsPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .finally(() => setProductsLoading(false));
  }, [id, productsPage, productsSortBy, productsSortOrder, productsQ]);

  useEffect(() => {
    if (!id || !['super_admin', 'admin', 'store_manager'].includes(role)) return;
    setLoading(true);
    fetch(`/api/admin/stores/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((s) => {
        setStore(s ?? null);
        if (s) {
          setEditName(s.name);
          setEditSlug(s.slug);
        }
      })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, [id, role]);

  useEffect(() => {
    if (!id || !['super_admin', 'admin', 'store_manager'].includes(role)) return;
    loadProducts();
  }, [id, role, loadProducts]);

  useEffect(() => {
    if (!canEditStore) return;
    fetch('/api/admin/assignable-managers')
      .then((res) => (res.ok ? res.json() : []))
      .then(setAssignableUsers)
      .catch(() => setAssignableUsers([]));
  }, [canEditStore]);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/stores/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to update');
        return;
      }
      toast.success('Store updated');
      setEditing(false);
      loadStore();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddManager = async () => {
    if (!addUserId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/stores/${id}/managers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: addUserId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to add');
        return;
      }
      toast.success('Manager added');
      setAddUserId('');
      loadStore();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveManager = async (userId: string) => {
    if (!confirm('Remove this manager from the store?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/stores/${id}/managers/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Failed to remove');
        return;
      }
      toast.success('Manager removed');
      loadStore();
    } finally {
      setSubmitting(false);
    }
  };

  if (!id || !['super_admin', 'admin', 'store_manager'].includes(role)) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">Not found or no access.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!store) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">Store not found.</p>
        <Link href="/admin/stores" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to stores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/stores" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to stores
      </Link>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <StoreIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              {editing && canEditStore ? (
                <form onSubmit={handleSaveStore} className="flex flex-wrap items-end gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground w-48"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Slug</label>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-border bg-background text-foreground w-40"
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">Save</button>
                  <button type="button" onClick={() => { setEditing(false); setEditName(store.name); setEditSlug(store.slug); }} className="px-3 py-2 rounded-lg border border-border text-sm">Cancel</button>
                </form>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-foreground">{store.name}</h1>
                  <p className="text-sm text-muted-foreground">{store.slug}</p>
                  {store._count != null && (
                    <p className="text-sm text-muted-foreground mt-1">{store._count.products ?? 0} products</p>
                  )}
                  {canEditStore && (
                    <button type="button" onClick={() => setEditing(true)} className="mt-2 text-sm text-primary hover:underline">Edit store</button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <h2 className="font-semibold text-foreground mb-3">Managers</h2>
          {canEditStore && assignableUsers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <select
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm min-w-[180px]"
              >
                <option value="">Add manager...</option>
                {assignableUsers.filter((u) => !store.storeManagers.some((m) => m.user.id === u.id)).map((u) => (
                  <option key={u.id} value={u.id}>{u.name ?? u.email} ({u.role})</option>
                ))}
              </select>
              <button type="button" onClick={handleAddManager} disabled={!addUserId || submitting} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">Add</button>
            </div>
          )}
          {store.storeManagers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No managers assigned.</p>
          ) : (
            <ul className="space-y-2">
              {store.storeManagers.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-foreground">{m.user.name ?? m.user.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground capitalize">{m.user.role.replace('_', ' ')}</span>
                    {canEditStore && (
                      <button type="button" onClick={() => handleRemoveManager(m.user.id)} disabled={submitting} className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" title="Remove">
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-6 border-t border-border">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <h2 className="font-semibold text-foreground">Products</h2>
            <div className="flex flex-wrap items-center gap-2">
              <FilterBar>
                <div className="min-w-[160px]">
                  <SearchInput
                    key={productsQ}
                    label="Search"
                    placeholder="Name, category…"
                    defaultValue={productsQ}
                    onSearch={(v) => { setProductsQ(v); setProductsPage(1); }}
                  />
                </div>
                <SortDropdown
                  options={[
                    { value: 'createdAt', label: 'Date' },
                    { value: 'name', label: 'Name' },
                    { value: 'price', label: 'Price' },
                    { value: 'stock', label: 'Stock' },
                  ]}
                  value={productsSortBy}
                  order={productsSortOrder}
                  onChange={(by, order) => { setProductsSortBy(by); setProductsSortOrder(order); setProductsPage(1); }}
                />
              </FilterBar>
              {(role === 'store_manager' || role === 'admin' || role === 'super_admin') && (
                <Link
                  href={`/admin/products/new?storeId=${store.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  <Plus className="h-4 w-4" /> Add product
                </Link>
              )}
            </div>
          </div>
          {productsLoading ? (
            <p className="text-sm text-muted-foreground">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products in this store.</p>
          ) : (
            <>
              <ul className="space-y-2">
                {products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{p.name}</span>
                      <span className="text-xs text-muted-foreground">({p.category})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{formatPrice(p.price)}</span>
                      <span className={`text-xs ${p.stock <= 10 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        Stock: {p.stock}
                      </span>
                      <Link href={`/admin/products/${p.id}/edit`} className="text-sm text-primary hover:underline">
                        Edit
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
              {productsPagination.totalPages > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Page {productsPagination.page} of {productsPagination.totalPages} ({productsPagination.total} products)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={productsPagination.page <= 1}
                      onClick={() => setProductsPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={productsPagination.page >= productsPagination.totalPages}
                      onClick={() => setProductsPage((p) => p + 1)}
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
    </div>
  );
}
