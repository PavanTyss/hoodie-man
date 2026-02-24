import Link from 'next/link';

/**
 * Site footer with shop links, customer service, legal, and copyright.
 * Uses theme-aware colors and Next.js Link for internal routes.
 */
export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-muted/50 to-transparent bg-muted border-t border-border mt-16 text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Hoodie Man</h3>
            <p className="text-muted-foreground">
              Your one-stop shop for premium hoodies, t-shirts, and apparel.
            </p>
            <p className="mt-2">
              <Link href="/about" className="text-primary hover:underline font-medium">
                About us
              </Link>
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/hoodies" className="hover:text-foreground transition-colors">
                  Hoodies
                </Link>
              </li>
              <li>
                <Link href="/t-shirts" className="hover:text-foreground transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/apparel" className="hover:text-foreground transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-foreground transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>
            &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> Hoodie Man. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
