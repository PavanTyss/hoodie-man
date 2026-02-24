'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Package } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatPrice, PRODUCT_PLACEHOLDER_IMAGE } from '@/lib/format';

function OrderItemImage({
  src,
  alt,
}: {
  src: string | undefined;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src ?? PRODUCT_PLACEHOLDER_IMAGE);
  useEffect(() => {
    setImgSrc(src ?? PRODUCT_PLACEHOLDER_IMAGE);
  }, [src]);
  return (
    <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setImgSrc(PRODUCT_PLACEHOLDER_IMAGE)}
      />
    </div>
  );
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  selectedSize: string;
  selectedColor: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  discount: number;
  promoCode?: string | null;
  trackingNumber?: string | null;
  shippingAddress?: { name?: string; address?: string; email?: string };
  createdAt: string;
  items: OrderItem[];
}

/**
 * Order detail page: single order with items, status, tracking, address.
 * Protected; redirects to login if not authenticated.
 */
export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading' || !session) return;

    const id = params?.id as string;
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setOrder(data ?? null);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [params?.id, session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-muted-foreground">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Order not found.</p>
        <Link href="/dashboard" className="text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    processing: 'bg-primary/20 text-primary',
    shipped: 'bg-accent/20 text-accent',
    delivered: 'bg-success/20 text-success',
    cancelled: 'bg-error/20 text-error',
  };
  const statusClass = statusColors[order.status] ?? 'bg-muted text-muted-foreground';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Account', href: '/dashboard' },
          { label: 'Orders', href: '/dashboard' },
          { label: `Order ${order.id.slice(0, 8)}` },
        ]}
        className="mb-6"
      />

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass}`}>
            {order.status}
          </span>
        </div>

        {order.trackingNumber && (
          <div className="p-6 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Tracking number</p>
            <p className="font-mono text-muted-foreground">{order.trackingNumber}</p>
          </div>
        )}

        {order.shippingAddress && (
          <div className="p-6 border-b border-border">
            <p className="text-sm font-semibold text-foreground mb-2">Shipping address</p>
            <p className="text-muted-foreground">
              {order.shippingAddress.name}
              <br />
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.email}
            </p>
          </div>
        )}

        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 items-center border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <OrderItemImage
                  src={item.product?.images?.[0]}
                  alt={item.product?.name ?? 'Product'}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{item.product?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.selectedSize} / {item.selectedColor} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
