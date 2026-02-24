'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/format';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Star } from 'lucide-react';
import { MouseEvent, useMemo, useState } from 'react';

interface ProductCardProps {
  product: Product;
}

/**
 * Product card for grids: image, name, description, rating, price, stock, color swatches.
 * Wishlist button; theme-aware styles; low-stock alert when stock < 5.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const initialSrc = useMemo(() => product.images?.[0] || PRODUCT_PLACEHOLDER_IMAGE, [product.images]);
  const [imgSrc, setImgSrc] = useState(initialSrc);

  const handleWishlistClick = (e: MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const discount = product.discount ?? 0;
  const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
  const lowStock = product.stock > 0 && product.stock < 5;

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`}>
        <div className="bg-card text-card-foreground rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:ring-2 hover:ring-primary/20 transition-all duration-300 border border-border">
          <div className="relative h-64 bg-muted overflow-hidden">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              loading="lazy"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={() => setImgSrc(PRODUCT_PLACEHOLDER_IMAGE)}
            />
            {product.featured && (
              <span className="absolute top-2 left-2 bg-warning text-background px-2 py-1 text-xs font-semibold rounded">
                Featured
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-2 right-2 bg-error text-white px-2 py-1 text-xs font-semibold rounded">
                -{discount}%
              </span>
            )}
            {lowStock && (
              <span className="absolute bottom-2 left-2 bg-warning/90 text-background px-2 py-1 text-xs font-semibold rounded">
                Only {product.stock} left!
              </span>
            )}
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>

            {reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating) ? 'fill-warning text-warning' : 'text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  product.stock > 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                }`}
              >
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>

      <button
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all z-10 ${
          inWishlist
            ? 'bg-error text-white hover:opacity-90'
            : 'bg-card text-muted-foreground hover:text-error border border-border'
        }`}
        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
