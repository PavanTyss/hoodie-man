'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/format';
import Button from '@/components/ui/Button';
import type { CartItem } from '@/types/product';

function CartItemImage({ item }: { item: CartItem }) {
  const [src, setSrc] = useState(item.images?.[0] ?? PRODUCT_PLACEHOLDER_IMAGE);
  return (
    <div className="relative w-24 h-24 bg-muted rounded-xl overflow-hidden shrink-0">
      <Image
        src={src}
        alt={item.name}
        fill
        className="object-cover"
        onError={() => setSrc(PRODUCT_PLACEHOLDER_IMAGE)}
      />
    </div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to get started!</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-base rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-md font-medium transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-error hover:bg-error/10 font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
              className="bg-card border border-border rounded-2xl shadow-sm p-6 flex items-center gap-4"
            >
              <CartItemImage item={item} />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="text-muted-foreground text-sm">
                  Size: {item.selectedSize} | Color: {item.selectedColor}
                </p>
                <p className="text-lg font-bold text-foreground mt-2">{formatPrice(item.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.selectedSize,
                      item.selectedColor,
                      item.quantity - 1
                    )
                  }
                  className="p-1.5 rounded border border-border hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold text-foreground">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      item.selectedSize,
                      item.selectedColor,
                      item.quantity + 1
                    )
                  }
                  className="p-1.5 rounded border border-border hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                aria-label="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            <Link href="/checkout" className="block mt-2">
              <Button fullWidth className="w-full">Proceed to Checkout</Button>
            </Link>

            <Link
              href="/"
              className="block w-full text-center text-primary hover:underline mt-4 font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
