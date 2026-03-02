'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
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
    setImgSrc(src ?? PRODUCT_PLACEHOLDER_IMAGE); // eslint-disable-line react-hooks/set-state-in-effect -- sync prop to state
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
  cancellationReason?: string | null;
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
  const [cancelReason, setCancelReason] = useState('');
  const [requestingCancel, setRequestingCancel] = useState(false);

  const loadOrder = () => {
    const id = params?.id as string;
    if (!id) return Promise.resolve();
    return fetch(`/api/orders/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOrder(data ?? null))
      .catch(() => setOrder(null));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading' || !session) return;

    const id = params?.id as string;
    if (!id) {
      setLoading(false); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }

    loadOrder().finally(() => setLoading(false));
  }, [params?.id, session, status, router]); // eslint-disable-line react-hooks/exhaustive-deps -- loadOrder refetch on id/session

  const requestCancel = () => {
    if (!cancelReason.trim() || !order) return;
    setRequestingCancel(true);
    fetch(`/api/orders/${order.id}/request-cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: cancelReason.trim() }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed'))))
      .then((updated) => {
        setOrder(updated);
        setCancelReason('');
        toast.success('Cancellation requested. Waiting for store approval.');
      })
      .catch(() => toast.error('Failed to request cancellation'))
      .finally(() => setRequestingCancel(false));
  };

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
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    accepted: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
    assigned_to_delivery: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    yet_to_deliver: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    out_for_delivery: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    shipped: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    pending_cancellation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  const statusClass = statusColors[order.status] ?? 'bg-muted text-muted-foreground';
  const canRequestCancel = ['pending', 'processing', 'accepted'].includes(order.status);

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
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {order.cancellationReason && order.status === 'pending_cancellation' && (
          <div className="p-6 border-b border-border bg-orange-50 dark:bg-orange-950/20">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Cancellation requested</p>
            <p className="text-sm text-muted-foreground mt-1">{order.cancellationReason}</p>
          </div>
        )}

        {canRequestCancel && (
          <div className="p-6 border-b border-border bg-muted/20">
            <p className="text-sm font-medium text-foreground mb-2">Request cancellation</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Reason for cancellation"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <button
                onClick={requestCancel}
                disabled={!cancelReason.trim() || requestingCancel}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
              >
                {requestingCancel ? 'Requesting...' : 'Request cancel'}
              </button>
            </div>
          </div>
        )}

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
