import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getFeaturedProductsFromDB, getProductsFromDB } from '@/lib/api';

export default async function Home() {
  const featuredProducts = await getFeaturedProductsFromDB();
  const allProducts = await getProductsFromDB();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">Welcome to Hoodie Man</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">Premium quality hoodies, t-shirts, and apparel for everyone. Style that speaks for itself.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hoodies"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
            >
              Shop Hoodies
            </Link>
            <Link
              href="/t-shirts"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-blue-600 hover:scale-105 transition-all shadow-lg"
            >
              Shop T-Shirts
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/hoodies" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🧥</div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600">Hoodies</h3>
                <p className="text-gray-600 mt-2">Cozy and stylish hoodies</p>
              </div>
            </Link>
            <Link href="/t-shirts" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-purple-300">
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">👕</div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600">T-Shirts</h3>
                <p className="text-gray-600 mt-2">Comfortable everyday tees</p>
              </div>
            </Link>
            <Link href="/apparel" className="group">
              <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-10 text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-pink-300">
                <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">👔</div>
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-pink-600">Apparel</h3>
                <p className="text-gray-600 mt-2">Complete your wardrobe</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </div>
  );
}
