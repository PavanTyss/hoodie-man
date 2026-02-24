'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, ShoppingBag, Shirt, Package, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

/**
 * Mobile hamburger menu with navigation links.
 * Theme-aware styles; closes on overlay click or link click.
 */
export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border shadow-xl z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Menu
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-muted-foreground hover:text-error transition-colors rounded-lg"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link
              href="/hoodies"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Hoodies</span>
            </Link>
            <Link
              href="/t-shirts"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors"
            >
              <Shirt className="h-5 w-5" />
              <span>T-Shirts</span>
            </Link>
            <Link
              href="/apparel"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors"
            >
              <Package className="h-5 w-5" />
              <span>Apparel</span>
            </Link>
            {session ? (
              <>
                <div className="border-t border-border my-2 pt-2" />
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>My Account</span>
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-error/10 text-error transition-colors text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-foreground transition-colors"
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
