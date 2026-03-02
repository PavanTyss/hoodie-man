'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

interface StoreOption {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetStoreId = searchParams.get('storeId') ?? '';
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeId, setStoreId] = useState(presetStoreId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('hoodies');
  const [images, setImages] = useState('');
  const [sizes, setSizes] = useState('S, M, L, XL, XXL');
  const [colors, setColors] = useState('');
  const [stock, setStock] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!['super_admin', 'admin', 'store_manager'].includes(role)) return;
    fetch('/api/admin/stores')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data: { items?: { id: string; name: string }[] } | { id: string; name: string }[]) => {
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        setStores(list);
        if (presetStoreId && list.some((s: { id: string }) => s.id === presetStoreId)) setStoreId(presetStoreId);
        else if (list.length && !storeId) setStoreId(list[0].id);
      })
      .catch(() => setStores([]));
  }, [role, presetStoreId]); // eslint-disable-line react-hooks/exhaustive-deps -- storeId set from response; omit to avoid loop

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !name.trim() || !description.trim()) {
      toast.error('Store, name and description required');
      return;
    }
    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);
    if (isNaN(numPrice) || numPrice <= 0 || isNaN(numStock) || numStock < 0) {
      toast.error('Valid price and stock required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          name: name.trim(),
          description: description.trim(),
          price: numPrice,
          category: category.trim() || 'hoodies',
          images: images.trim() ? images.split(',').map((u) => u.trim()).filter(Boolean) : [''],
          sizes: sizes.trim() ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : ['M'],
          colors: colors.trim() ? colors.split(',').map((c) => c.trim()).filter(Boolean) : ['Black'],
          stock: numStock,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create product');
        return;
      }
      toast.success('Product created');
      router.push(`/admin/stores/${storeId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!['super_admin', 'admin', 'store_manager'].includes(role)) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">No access.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
        <h1 className="text-xl font-bold text-foreground mb-6">Add product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Store</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            >
              <option value="">Select store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. hoodies, t-shirts"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image URLs (comma-separated)</label>
            <input
              type="text"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Sizes (comma-separated)</label>
            <input
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Colors (comma-separated)</label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="Black, Navy"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create product'}
            </button>
            <Link href="/admin/products" className="px-4 py-2 rounded-lg border border-border">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
