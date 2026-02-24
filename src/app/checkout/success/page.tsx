'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { CheckCircle, Package, Home, Printer } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import Button from '@/components/ui/Button';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<{
    id: string;
    total: number;
    items?: { quantity: number; product?: { name: string } }[];
  } | null>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setOrder(data))
        .catch(() => {});
    }
  }, [orderId]);

  const handlePrint = () => window.print();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-success/20 p-4">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Thank you for your order!</h1>
        <p className="text-muted-foreground mb-6">
          We&apos;ve received your order and will process it shortly.
        </p>
        {orderId && (
          <p className="text-sm text-muted-foreground mb-4 font-mono">
            Order ID: <span className="text-foreground font-semibold">{orderId}</span>
          </p>
        )}
        {order && (
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-foreground">
              Total: {formatPrice(order.total ?? 0)}
            </p>
            {order.items?.length ? (
              <p className="text-sm text-muted-foreground mt-1">
                {order.items.reduce((acc: number, i: { quantity: number }) => acc + i.quantity, 0)}{' '}
                item(s)
              </p>
            ) : null}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-md transition"
          >
            <Package className="h-5 w-5" />
            View orders
          </Link>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handlePrint}
            className="gap-2 print:hidden"
          >
            <Printer className="h-5 w-5" />
            Print
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-md transition"
          >
            <Home className="h-5 w-5" />
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Order confirmation / thank you page after checkout.
 * Reads orderId from query; optionally fetches order details for summary.
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
