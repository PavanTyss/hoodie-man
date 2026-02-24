'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { Product } from '@/types/product';

const INITIAL_PAGE_SIZE = 12;
const PAGE_SIZE = 12;

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (query) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [query, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-foreground mb-4">
        {query ? `Search Results for "${query}"` : 'All Products'}
      </h1>

      {filteredProducts.length > 0 ? (
        <>
          <p className="text-muted-foreground mb-8">
            Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length > visibleCount && (
            <div className="mt-10 text-center">
              <Button
                type="button"
                onClick={() =>
                  setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredProducts.length))
                }
                aria-label="Load more products"
              >
                Load more ({filteredProducts.length - visibleCount} left)
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
            No results for &quot;{query}&quot;. Try different keywords.
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
