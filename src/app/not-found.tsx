import Link from 'next/link';
import { Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            The page you&apos;re looking for seems to have wandered off. Let&apos;s get you back on track!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/"
            className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Home className="h-8 w-8" />
            </div>
            <span className="font-semibold text-foreground">Home</span>
            <span className="text-sm text-muted-foreground">Back to homepage</span>
          </Link>

          <Link
            href="/search"
            className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <Search className="h-8 w-8" />
            </div>
            <span className="font-semibold text-foreground">Search</span>
            <span className="text-sm text-muted-foreground">Find products</span>
          </Link>

          <Link
            href="/hoodies"
            className="flex flex-col items-center gap-3 p-6 bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all"
          >
            <div className="bg-primary/10 p-4 rounded-full text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <span className="font-semibold text-foreground">Shop</span>
            <span className="text-sm text-muted-foreground">Browse products</span>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
