'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types/product';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const moveToCart = (product: Product) => {
    addToCart(product, product.sizes[0], product.colors[0]);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-8">
            Save items you love and shop them later!
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-base rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-md font-medium transition"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Wishlist ({wishlist.length})</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1 text-sm"
                onClick={() => moveToCart(product)}
              >
                Move to Cart
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeFromWishlist(product.id)}
                className="text-sm"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
