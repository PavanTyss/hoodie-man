import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Hoodie Man orders, shipping, and returns.',
};

/**
 * Static FAQ page. Link from footer.
 */
export default function FAQPage() {
  const faqs = [
    {
      q: 'How long does shipping take?',
      a: 'Standard shipping typically takes 5–7 business days. Express options are available at checkout.',
    },
    {
      q: 'What is your return policy?',
      a: 'You may return unworn items within 30 days of delivery. See our Returns page for full details.',
    },
    {
      q: 'How can I track my order?',
      a: 'Once your order ships, you will receive an email with a tracking link. You can also visit the Order tracking page and enter your order ID and email.',
    },
    {
      q: 'Do you offer international shipping?',
      a: 'We currently ship within the US. International shipping may be added in the future.',
    },
    {
      q: 'How do I change or cancel my order?',
      a: 'Contact us as soon as possible. We can modify or cancel orders that have not yet shipped.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <h1 className="text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-10">
        Find answers to common questions about orders, shipping, and returns.
      </p>
      <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
        <dl className="space-y-6 divide-y divide-border first:pt-0">
          {faqs.map((faq, index) => (
            <div key={index} className="pt-6 first:pt-0">
              <dt className="text-lg font-semibold text-foreground mb-2">{faq.q}</dt>
              <dd className="text-muted-foreground pl-0">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-12 text-muted-foreground">
        Still have questions?{' '}
        <Link href="/contact" className="text-primary hover:underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
