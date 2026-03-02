'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Heart, Star, ZoomIn, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types/product';
import ShareButtons from '@/components/ShareButtons';
import ProductCard from '@/components/ProductCard';
import Button from '@/components/ui/Button';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/format';

function EditReviewForm({
  review,
  onSave,
  onCancel,
}: {
  review: { rating: number; title: string | null; comment: string };
  onSave: (data: { rating: number; title?: string | null; comment: string }) => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title ?? '');
  const [comment, setComment] = useState(review.comment);
  return (
    <form
      className="mt-3 p-3 rounded-lg bg-muted/30 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ rating, title: title.trim() || null, comment: comment.trim() });
      }}
    >
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full max-w-[80px] px-2 py-1.5 rounded border border-border bg-background text-foreground text-sm"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground text-sm"
          placeholder="Review title"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full px-2 py-1.5 rounded border border-border bg-background text-foreground text-sm"
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const [shareUrl, setShareUrl] = useState('');
  const [brokenImageIndexes, setBrokenImageIndexes] = useState<Record<number, true>>({});

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reviews, setReviews] = useState<{ id: string; rating: number; title: string | null; comment: string; userName: string; createdAt: string; isOwn?: boolean }[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  useSession(); // auth state for review ownership

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((productData) => {
        if (!productData) {
          setLoading(false);
          return;
        }
        setProduct(productData);
        const category = productData.category;
        if (!category) {
          setRelatedProducts([]);
          setLoading(false);
          return;
        }
        fetch(`/api/products?category=${encodeURIComponent(category)}&limit=5&sortBy=createdAt&sortOrder=desc`)
          .then((r) => r.json())
          .then((data) => {
            const list = data?.items ?? [];
            const related = list
              .filter((p: Product) => p.id !== productData.id)
              .slice(0, 4);
            setRelatedProducts(related);
          })
          .catch(() => setRelatedProducts([]))
          .finally(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL for share
    setShareUrl(window.location.href);
  }, [id]);

  const loadReviews = () => {
    if (!id) return;
    setReviewsLoading(true);
    fetch(`/api/products/${id}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    loadReviews(); // eslint-disable-line react-hooks/set-state-in-effect -- data fetch
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps -- loadReviews refetch on id

  const refetchProduct = () => {
    fetch(`/api/products/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setProduct(data));
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to delete');
        return;
      }
      toast.success('Review deleted');
      loadReviews();
      refetchProduct();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleUpdateReview = async (reviewId: string, data: { rating: number; title?: string | null; comment: string }) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error ?? 'Failed to update');
        return;
      }
      toast.success('Review updated');
      setEditingReviewId(null);
      loadReviews();
      refetchProduct();
    } catch {
      toast.error('Failed to update review');
    }
  };

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
      toast.error('Please select size and color');
      return;
    }

    addToCart(product, selectedSize, selectedColor);
    setShowSuccess(true);
    toast.success('Added to cart');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const rating = product.rating ?? 4.5;
  const reviewCount = product.reviewCount ?? 0;
  const discount = product.discount ?? 0;
  const finalPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/" className="flex items-center text-primary hover:text-primary/90 mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative bg-muted rounded-xl h-96 mb-4 overflow-hidden group">
            <Image
              src={
                brokenImageIndexes[selectedImage]
                  ? PRODUCT_PLACEHOLDER_IMAGE
                  : product.images?.[selectedImage] || PRODUCT_PLACEHOLDER_IMAGE
              }
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              priority
              onError={() => setBrokenImageIndexes((prev) => ({ ...prev, [selectedImage]: true }))}
            />
            <button className="absolute top-4 right-4 bg-card text-foreground p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Zoom">
              <ZoomIn className="h-5 w-5" />
            </button>
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-error text-primary-foreground px-3 py-1 text-sm font-semibold rounded">
                {discount}% OFF
              </span>
            )}
          </div>
          {(product.images ?? []).length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {(product.images ?? []).map((image, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative bg-muted rounded h-20 overflow-hidden border-2 transition ${
                    selectedImage === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={brokenImageIndexes[i] ? PRODUCT_PLACEHOLDER_IMAGE : image}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover"
                    onError={() => setBrokenImageIndexes((prev) => ({ ...prev, [i]: true }))}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="relative bg-muted rounded h-20 w-20 overflow-hidden border-2 border-primary">
              <Image
                src={PRODUCT_PLACEHOLDER_IMAGE}
                alt="No image"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(rating) ? 'fill-warning text-warning' : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} ({reviewCount} reviews)
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            {discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-primary">{formatPrice(finalPrice)}</span>
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-error/10 text-error px-2 py-1 rounded text-sm font-semibold">
                  Save {formatPrice(product.price - finalPrice)}
                </span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          {/* Share Buttons */}
          <div className="mb-6">
            <ShareButtons url={shareUrl} title={product.name} />
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-foreground">Select Size</label>
              <Link href="/size-guide" className="text-sm text-primary hover:underline">
                Size guide
              </Link>
            </div>
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
            <label className="block text-sm font-semibold text-foreground mb-2">Select Color</label>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                    selectedColor === color
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span
              className={`text-sm font-semibold ${product.stock > 0 ? 'text-success' : 'text-error'}`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Add to Cart and Wishlist Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
              size="lg"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <button
              onClick={toggleWishlist}
              className={`px-6 py-4 rounded-lg border-2 transition ${
                isInWishlist(product.id)
                  ? 'bg-error/10 border-error text-error'
                  : 'border-border hover:border-error hover:text-error'
              }`}
              aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
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

          {/* Reviews */}
          <div className="mt-8 border-t pt-8">
            <h3 className="font-semibold text-foreground mb-4">Reviews ({reviews.length})</h3>
            {reviewsLoading ? (
              <p className="text-sm text-muted-foreground">Loading reviews…</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < r.rating ? 'fill-warning text-warning' : 'text-muted'}`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground">{r.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {r.title && <p className="font-medium text-foreground text-sm">{r.title}</p>}
                        <p className="text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                      {r.isOwn && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingReviewId(editingReviewId === r.id ? null : r.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted"
                            title="Edit review"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingReviewId === r.id && (
                      <EditReviewForm
                        review={r}
                        onSave={(data) => handleUpdateReview(r.id, data)}
                        onCancel={() => setEditingReviewId(null)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
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
