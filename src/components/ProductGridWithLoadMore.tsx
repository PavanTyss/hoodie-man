'use client';

import { useState, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';

const PAGE_SIZE = 12;

/**
 * Renders a product grid with incremental "Load more" fetching from API.
 * Uses server-rendered initial products for fast first paint; fetches more on demand.
 */
export default function ProductGridWithLoadMore({
  initialProducts,
  totalProducts,
}: {
  initialProducts: Product[];
  totalProducts: number;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(() => Math.ceil(initialProducts.length / PAGE_SIZE) || 1);
  const [loading, setLoading] = useState(false);
  const hasMore = products.length < totalProducts;

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    fetch(`/api/products?page=${nextPage}&limit=${PAGE_SIZE}&sortBy=createdAt&sortOrder=desc`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.items ?? [];
        setProducts((prev) => [...prev, ...list]);
        setPage(nextPage);
      })
      .finally(() => setLoading(false));
  }, [page, loading, hasMore]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-10 text-center">
          <Button
            type="button"
            onClick={loadMore}
            disabled={loading}
            aria-label="Load more products"
          >
            {loading ? 'Loading…' : `Load more (${totalProducts - products.length} left)`}
          </Button>
        </div>
      )}
    </>
  );
}
