'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { FilterState } from '@/components/ProductFilters';
import { ProductGridSkeleton } from '@/components/LoadingSkeletons';
import { Product } from '@/types/product';

const ProductFilters = dynamic(() => import('@/components/ProductFilters').then((m) => m.default), {
  ssr: true,
});

interface CategoryProductsProps {
  category: string;
}

/** Number of products shown initially; each "Load more" adds this many. */
const INITIAL_PAGE_SIZE = 12;
const PAGE_SIZE = 12;

export default function CategoryProducts({ category }: CategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const categoryProducts = data.filter((p: Product) => p.category === category);
        setProducts(categoryProducts);
        setFilteredProducts(categoryProducts);
        setVisibleCount(INITIAL_PAGE_SIZE);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

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
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  const handleSortChange = (sort: string) => {
    let sorted = [...filteredProducts];

    switch (sort) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      case 'popular':
        sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    setFilteredProducts(sorted);
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = filteredProducts.length > visibleCount;
  const loadMore = () => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length));

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

      <ProductFilters
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        categories={[category]}
        priceRange={priceRange}
      />

      <div className="mb-6">
        <p className="text-muted-foreground">{filteredProducts.length} products found</p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products match your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 text-center">
              <Button type="button" onClick={loadMore} aria-label="Load more products">
                Load more ({filteredProducts.length - visibleCount} left)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
