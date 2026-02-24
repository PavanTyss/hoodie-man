import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Size Guide',
  description: 'Hoodie Man size chart for hoodies, t-shirts, and apparel. Find your fit.',
};

/**
 * Static size guide page with size chart table. Product detail can link here.
 */
export default function SizeGuidePage() {
  const hoodieSizes = [
    { size: 'XS', chest: '34-36"', length: '26"', sleeve: '32"', shoulder: '16"' },
    { size: 'S', chest: '36-38"', length: '27"', sleeve: '33"', shoulder: '17"' },
    { size: 'M', chest: '38-40"', length: '28"', sleeve: '34"', shoulder: '18"' },
    { size: 'L', chest: '40-42"', length: '29"', sleeve: '35"', shoulder: '19"' },
    { size: 'XL', chest: '42-44"', length: '30"', sleeve: '36"', shoulder: '20"' },
    { size: '2XL', chest: '44-46"', length: '31"', sleeve: '37"', shoulder: '21"' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-foreground mb-2">Size Guide</h1>
      <p className="text-muted-foreground mb-10">
        Use the chart below to find your best fit. All measurements are in inches. If you&apos;re
        between sizes, we recommend sizing up for a relaxed fit.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-muted">
              <th className="text-left p-4 font-semibold text-foreground">Size</th>
              <th className="text-left p-4 font-semibold text-foreground">Chest</th>
              <th className="text-left p-4 font-semibold text-foreground">Length</th>
              <th className="text-left p-4 font-semibold text-foreground">Sleeve</th>
              <th className="text-left p-4 font-semibold text-foreground">Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {hoodieSizes.map((row) => (
              <tr key={row.size} className="border-t border-border even:bg-muted/30">
                <td className="p-4 font-medium text-foreground">{row.size}</td>
                <td className="p-4 text-muted-foreground">{row.chest}</td>
                <td className="p-4 text-muted-foreground">{row.length}</td>
                <td className="p-4 text-muted-foreground">{row.sleeve}</td>
                <td className="p-4 text-muted-foreground">{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-muted-foreground text-sm">
        Sizes may vary slightly by style. For product-specific fit notes, check the product page.
      </p>

      <p className="mt-12 text-muted-foreground">
        <Link href="/" className="text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
