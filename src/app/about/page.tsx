import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Hoodie Man – our story, mission, and commitment to quality apparel.',
};

/**
 * Static About page: brand story, mission. Linked from Footer.
 */
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-2">About Hoodie Man</h1>
      <p className="text-muted-foreground mb-10">
        Your one-stop shop for premium hoodies, t-shirts, and apparel.
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-foreground">
        <p>
          Hoodie Man started with a simple idea: everyone deserves comfortable, well-made clothing
          that looks great. We focus on quality materials, thoughtful design, and fair prices.
        </p>
        <p>
          Our mission is to offer a curated selection of hoodies, t-shirts, and apparel that fit
          your lifestyle – whether you&apos;re at home, at work, or out with friends.
        </p>
        <p>
          We believe in transparency, sustainability where we can, and putting the customer first.
          If you have questions or feedback, we&apos;d love to <Link href="/contact" className="text-primary hover:underline">hear from you</Link>.
        </p>
      </div>

      <p className="mt-12 text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
