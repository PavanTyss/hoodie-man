'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Package, User, Heart, MapPin, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut } from 'next-auth/react';

/**
 * Shared layout for My Account: sidebar nav + main content.
 * Protects routes (redirects to login if unauthenticated).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const role = (session.user as { role?: string })?.role ?? 'user';
  const isStaff = ['super_admin', 'admin', 'store_manager', 'delivery_agent'].includes(role);
  const navItems = [
    { href: '/dashboard', icon: Package, label: 'Orders' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/addresses', icon: MapPin, label: 'Addresses' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-b border-border">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold ring-2 ring-primary/20 ring-offset-2 ring-offset-background shrink-0">
                  {session.user?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {session.user?.name ?? 'Account'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
              {isStaff && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 shrink-0" />
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3 min-w-0">{children}</main>
      </div>
    </div>
  );
}
