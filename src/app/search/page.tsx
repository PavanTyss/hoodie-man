'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { Product } from '@/types/product';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === undefined) p.delete(k);
        else p.set(k, String(v));
      });
      if (p.get('page') === '1') p.delete('page');
      router.replace(`/search${p.toString() ? `?${p.toString()}` : ''}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (query) params.set('q', query);
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect -- data fetch
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.items ?? []);
        setPagination(
          data.pagination ?? { page: 1, limit: PAGE_SIZE, total: data.items?.length ?? 0, totalPages: 1 }
        );
      })
      .catch(() => {
        setProducts([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [query, page, sortBy, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {query ? `Search Results for "${query}"` : 'All Products'}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="text-muted-foreground">
          {loading ? 'Loading…' : `${pagination.total} ${pagination.total === 1 ? 'product' : 'products'}`}
        </p>
        <SortDropdown
          options={SORT_OPTIONS}
          value={sortBy}
          order={sortOrder}
          onChange={(by, order) => setParams({ sortBy: by, sortOrder: order, page: 1 })}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading…</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setParams({ page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setParams({ page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted text-muted-foreground mb-4">
            <SearchIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No products found</h2>
          <p className="text-muted-foreground mb-6">
            {query ? `No results for "${query}". Try different keywords.` : 'No products available.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-base rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg font-medium transition"
          >
            Browse products
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
