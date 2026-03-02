'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { FilterState } from '@/components/ProductFilters';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { Product } from '@/types/product';

const ProductFilters = dynamic(() => import('@/components/ProductFilters').then((m) => m.default), {
  ssr: true,
});

const PAGE_SIZE = 12;

export interface CategoryInitialData {
  items: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface CategoryProductsProps {
  category: string;
  /** Server-fetched first page for instant first paint; avoids client loading state. */
  initialData?: CategoryInitialData;
}


const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
];

export default function CategoryProducts({ category, initialData }: CategoryProductsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

  const [products, setProducts] = useState<Product[]>(initialData?.items ?? []);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData?.items ?? []);
  const [pagination, setPagination] = useState(
    initialData?.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 }
  );
  const [loading, setLoading] = useState(!initialData);

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === undefined) p.delete(k);
        else p.set(k, String(v));
      });
      if (p.get('page') === '1') p.delete('page');
      router.replace(`${window.location.pathname}${p.toString() ? `?${p.toString()}` : ''}`);
    },
    [searchParams, router]
  );

  useEffect(() => {
    const isInitialPage = page === 1 && sortBy === 'createdAt' && sortOrder === 'desc';
    if (initialData && isInitialPage) return; // already have server data for this params
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect -- data fetch
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.items ?? [];
        setProducts(list);
        setFilteredProducts(list);
        setPagination(
          data.pagination ?? { page: 1, limit: PAGE_SIZE, total: list.length, totalPages: 1 }
        );
      })
      .catch(() => {
        setProducts([]);
        setFilteredProducts([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [category, page, sortBy, sortOrder, initialData]);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...products];

    // Filter by price
    filtered = filtered.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax);

    // Filter by sizes
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((p) => filters.sizes.some((size) => p.sizes.includes(size)));
    }

    // Filter by colors
    if (filters.colors.length > 0) {
      filtered = filtered.filter((p) =>
        filters.colors.some((color) =>
          p.colors.some((pColor) => pColor.toLowerCase() === color.toLowerCase())
        )
      );
    }

    // Filter by stock
    if (filters.inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    setFilteredProducts(filtered);
  };

  const handleSortChange = (sort: string) => {
    const map: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
      'price-low': { sortBy: 'price', sortOrder: 'asc' },
      'price-high': { sortBy: 'price', sortOrder: 'desc' },
      newest: { sortBy: 'createdAt', sortOrder: 'desc' },
      popular: { sortBy: 'createdAt', sortOrder: 'desc' },
      rating: { sortBy: 'createdAt', sortOrder: 'desc' },
    };
    const next = map[sort];
    if (next) setParams({ sortBy: next.sortBy, sortOrder: next.sortOrder, page: 1 });
  };

  const priceRange =
    products.length > 0
      ? {
          min: Math.floor(Math.min(...products.map((p) => p.price))),
          max: Math.ceil(Math.max(...products.map((p) => p.price))),
        }
      : { min: 0, max: 100 };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-10 bg-muted rounded w-48 mb-8 animate-pulse"></div>
        <ProductGridSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-8 capitalize">{category}</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <ProductFilters
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          categories={[category]}
          priceRange={priceRange}
        />
        <SortDropdown
          options={SORT_OPTIONS}
          value={sortBy}
          order={sortOrder}
          onChange={(by, order) => setParams({ sortBy: by, sortOrder: order, page: 1 })}
        />
      </div>

      <div className="mb-6">
        <p className="text-muted-foreground">
          {loading ? '…' : `${filteredProducts.length} products found`}
          {pagination.totalPages > 1 && ` · Page ${pagination.page} of ${pagination.totalPages}`}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
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
      )}
    </div>
  );
}
