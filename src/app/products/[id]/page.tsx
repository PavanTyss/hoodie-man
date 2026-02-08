'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Heart, Star, ZoomIn } from 'lucide-react';
import { Product } from '@/types/product';
import ShareButtons from '@/components/ShareButtons';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ]).then(([productData, allProducts]) => {
      setProduct(productData);
      // Get related products from same category
      const related = allProducts
        .filter((p: Product) => p.category === productData.category && p.id !== productData.id)
        .slice(0, 4);
      setRelatedProducts(related);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }
    
    addToCart(product, selectedSize, selectedColor);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const rating = (product as any).rating || 4.5;
  const reviewCount = (product as any).reviewCount || 0;
  const discount = (product as any).discount || 0;
  const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative bg-gray-200 rounded-lg h-96 mb-4 overflow-hidden group">
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              priority
            />
            <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="h-5 w-5 text-gray-700" />
            </button>
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm font-semibold rounded">
                {discount}% OFF
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative bg-gray-200 rounded h-20 overflow-hidden border-2 transition ${
                  selectedImage === i ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            {discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-blue-600">
                  ${finalPrice.toFixed(2)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">
                  Save ${(product.price - finalPrice).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-blue-600">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          <p className="text-gray-700 mb-6">{product.description}</p>

          {/* Share Buttons */}
          <div className="mb-6">
            <ShareButtons
              url={typeof window !== 'undefined' ? window.location.href : ''}
              title={product.name}
            />
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Size
            </label>
            <div className="flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                    selectedSize === size
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Color
            </label>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                    selectedColor === color
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart and Wishlist Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              onClick={toggleWishlist}
              className={`px-6 py-4 rounded-lg border-2 transition ${
                isInWishlist(product.id)
                  ? 'bg-red-50 border-red-500 text-red-500'
                  : 'border-gray-300 hover:border-red-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {showSuccess && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              Product added to cart successfully!
            </div>
          )}

          {/* Product Features */}
          <div className="mt-8 border-t pt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Product Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Premium quality fabric</li>
              <li>• Comfortable fit</li>
              <li>• Machine washable</li>
              <li>• Available in multiple sizes and colors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
