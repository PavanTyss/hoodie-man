import Link from 'next/link';
import { Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for seems to have wandered off. Let's get you back on track!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="bg-blue-100 p-4 rounded-full">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <span className="font-semibold text-gray-900">Home</span>
            <span className="text-sm text-gray-600">Back to homepage</span>
          </Link>

          <Link
            href="/search"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="bg-purple-100 p-4 rounded-full">
              <Search className="h-8 w-8 text-purple-600" />
            </div>
            <span className="font-semibold text-gray-900">Search</span>
            <span className="text-sm text-gray-600">Find products</span>
          </Link>

          <Link
            href="/hoodies"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <div className="bg-pink-100 p-4 rounded-full">
              <ShoppingBag className="h-8 w-8 text-pink-600" />
            </div>
            <span className="font-semibold text-gray-900">Shop</span>
            <span className="text-sm text-gray-600">Browse products</span>
          </Link>
        </div>

        <div className="text-sm text-gray-600">
          <p>Need help? <Link href="/contact" className="text-blue-600 hover:underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  );
}
