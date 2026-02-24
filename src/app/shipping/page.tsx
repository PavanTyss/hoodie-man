import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping Info',
  description: 'Shipping options, delivery times, and costs for Hoodie Man orders.',
};

/**
 * Static shipping info page. Link from footer.
 */
export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-2">Shipping Information</h1>
      <p className="text-muted-foreground mb-10">
        We ship to addresses within the United States. Below are our standard options and timelines.
      </p>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Standard Shipping</h2>
          <p className="text-muted-foreground">
            Free on orders over ₹500. Otherwise a flat rate applies at checkout. Delivery in 5–7
            business days.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Express Shipping</h2>
          <p className="text-muted-foreground">
            Available at checkout for an additional fee. Delivery in 2–3 business days.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Order Processing</h2>
          <p className="text-muted-foreground">
            Orders placed before 2 PM (local time) on business days typically ship the same day. You
            will receive a confirmation email with tracking once your order has shipped.
          </p>
        </div>
      </section>

      <p className="mt-12 text-muted-foreground">
        For returns, see our{' '}
        <Link href="/returns" className="text-primary hover:underline">
          Returns policy
        </Link>
        . Questions?{' '}
        <Link href="/contact" className="text-primary hover:underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
