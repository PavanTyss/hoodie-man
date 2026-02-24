import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Package, Shirt, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductGridWithLoadMore from '@/components/ProductGridWithLoadMore';
import { getFeaturedProductsFromDB, getProductsFromDB } from '@/lib/api';

const NewsletterSignup = dynamic(() => import('@/components/NewsletterSignup'), { ssr: true });

export default async function Home() {
  const featuredProducts = await getFeaturedProductsFromDB();
  const allProducts = await getProductsFromDB();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" aria-hidden />
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] bg-[length:24px_24px]" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Hoodie Man</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Premium quality hoodies, t-shirts, and apparel for everyone. Style that speaks for
            itself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hoodies"
              className="bg-card text-primary px-8 py-3 rounded-full font-bold hover:opacity-90 hover:scale-105 transition-all shadow-lg"
            >
              Shop Hoodies
            </Link>
            <Link
              href="/t-shirts"
              className="bg-transparent border-2 border-card text-card rounded-full font-bold px-8 py-3 hover:bg-card hover:text-primary transition-all shadow-lg"
            >
              Shop T-Shirts
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/hoodies" className="group">
              <div className="bg-card rounded-2xl p-10 text-center hover:shadow-lg transition-all duration-300 border border-border hover:border-primary">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary">
                  Hoodies
                </h3>
                <p className="text-muted-foreground mt-2">Cozy and stylish hoodies</p>
              </div>
            </Link>
            <Link href="/t-shirts" className="group">
              <div className="bg-card rounded-2xl p-10 text-center hover:shadow-lg transition-all duration-300 border border-border hover:border-primary">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Shirt className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary">
                  T-Shirts
                </h3>
                <p className="text-muted-foreground mt-2">Comfortable everyday tees</p>
              </div>
            </Link>
            <Link href="/apparel" className="group">
              <div className="bg-card rounded-2xl p-10 text-center hover:shadow-lg transition-all duration-300 border border-border hover:border-primary">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary">
                  Apparel
                </h3>
                <p className="text-muted-foreground mt-2">Complete your wardrobe</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* All Products – incremental load more */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-foreground mb-8">All Products</h2>
        <ProductGridWithLoadMore products={allProducts} />
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
}
