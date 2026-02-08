'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { useWishlist } from '@/context/WishlistContext';
import { Heart, Star } from 'lucide-react';
import { MouseEvent } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const rating = (product as any).rating || 0;
  const reviewCount = (product as any).reviewCount || 0;
  const discount = (product as any).discount || 0;
  const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`}>
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          <div className="relative h-64 bg-gray-200 overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            {product.featured && (
              <span className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 text-xs font-semibold rounded">
                Featured
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                -{discount}%
              </span>
            )}
          </div>
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            
            {/* Rating */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">({reviewCount})</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {discount > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-blue-600">
                      ${finalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all ${
          inWishlist
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
