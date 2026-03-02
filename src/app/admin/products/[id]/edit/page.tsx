'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  storeId: string | null;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  images: string[] | string;
  sizes: string[] | string;
  colors: string[] | string;
  stock: number;
  featured: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState('');
  const [sizes, setSizes] = useState('');
  const [colors, setColors] = useState('');
  const [stock, setStock] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !['super_admin', 'admin', 'store_manager'].includes(role)) return;
    fetch(`/api/admin/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((p) => {
        if (p) {
          setProduct(p);
          setName(p.name);
          setDescription(p.description);
          setPrice(String(p.price));
          setCategory(p.category ?? '');
          setImages(Array.isArray(p.images) ? p.images.join(', ') : (p.images || ''));
          setSizes(Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || ''));
          setColors(Array.isArray(p.colors) ? p.colors.join(', ') : (p.colors || ''));
          setStock(String(p.stock ?? 0));
        } else setProduct(null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10);
    if (isNaN(numPrice) || numPrice <= 0 || isNaN(numStock) || numStock < 0) {
      toast.error('Valid price and stock required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: numPrice,
          category: category.trim() || 'hoodies',
          images: images.trim() ? images.split(',').map((u) => u.trim()).filter(Boolean) : undefined,
          sizes: sizes.trim() ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          colors: colors.trim() ? colors.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
          stock: numStock,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to update');
        return;
      }
      toast.success('Product updated');
      if (product.storeId) router.push(`/admin/stores/${product.storeId}`);
      else router.push('/admin/products');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm('Delete this product?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to delete');
        return;
      }
      toast.success('Product deleted');
      if (product.storeId) router.push(`/admin/stores/${product.storeId}`);
      else router.push('/admin/products');
    } finally {
      setDeleting(false);
    }
  };

  if (!id || !['super_admin', 'admin', 'store_manager'].includes(role)) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">No access.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!product) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">Product not found.</p>
        <Link href="/admin/products" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={product.storeId ? `/admin/stores/${product.storeId}` : '/admin/products'} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
        <h1 className="text-xl font-bold text-foreground mb-6">Edit product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image URLs (comma-separated)</label>
            <input
              type="text"
              value={images}
              onChange={(e) => setImages(e.target.value)}
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
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
            <Link href={product.storeId ? `/admin/stores/${product.storeId}` : '/admin/products'} className="px-4 py-2 rounded-lg border border-border">
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
