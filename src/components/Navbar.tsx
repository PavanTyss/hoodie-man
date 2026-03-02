'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingCart, User, LogOut, Search, Heart, LayoutDashboard } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import MobileMenu from './MobileMenu';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { getCartItemCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const itemCount = getCartItemCount();
  const wishlistCount = getWishlistCount();
  const { data: session } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string })?.role ?? '';
  const isStaff = ['super_admin', 'admin', 'store_manager', 'delivery_agent'].includes(role);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-card/80 text-card-foreground shadow-sm sticky top-0 z-50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <MobileMenu />
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform"
            >
              Hoodie Man
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/hoodies"
              className="text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              Hoodies
            </Link>
            <Link
              href="/t-shirts"
              className="text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              T-Shirts
            </Link>
            <Link
              href="/apparel"
              className="text-muted-foreground hover:text-foreground px-3 py-2 transition-colors"
            >
              Apparel
            </Link>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-border rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center gap-2">
                {isStaff && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Admin dashboard"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm hidden sm:inline">Admin</span>
                    </Link>
                    <span className="text-sm text-muted-foreground/70 hidden sm:inline">|</span>
                  </>
                )}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label="My account"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm hidden sm:inline">My Account</span>
                </Link>
                <span className="text-sm text-muted-foreground/70 hidden sm:inline">|</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-muted-foreground hover:text-error transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="text-sm">Login</span>
              </Link>
            )}
            <Link
              href="/wishlist"
              className="relative p-2 text-muted-foreground hover:text-error transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-border rounded-full bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
