'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';

const INITIAL_PAGE_SIZE = 12;
const PAGE_SIZE = 12;

/**
 * Renders a product grid with incremental "Load more" to avoid rendering all items at once.
 * Used on the home page for the "All Products" section.
 */
export default function ProductGridWithLoadMore({ products }: { products: Product[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const visible = products.slice(0, visibleCount);
  const hasMore = products.length > visibleCount;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-10 text-center">
          <Button
            type="button"
            onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length))}
            aria-label="Load more products"
          >
            Load more ({products.length - visibleCount} left)
          </Button>
        </div>
      )}
    </>
  );
}
