'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Store, Package, FileText, Box } from 'lucide-react';
import { signOut } from 'next-auth/react';

const STAFF_ROLES = ['super_admin', 'admin', 'store_manager', 'delivery_agent'];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const role = (session?.user as { role?: string })?.role ?? 'user';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading' || !session) return;
    if (!STAFF_ROLES.includes(role)) {
      router.push('/dashboard');
    }
  }, [status, session, role, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!STAFF_ROLES.includes(role)) {
    return null;
  }

  const navItems: { href: string; label: string; icon: typeof LayoutDashboard; roles: string[] }[] = [
    { href: '/admin', label: 'Home', icon: LayoutDashboard, roles: STAFF_ROLES },
    { href: '/admin/orders', label: 'Orders', icon: Package, roles: STAFF_ROLES },
    { href: '/admin/products', label: 'Products', icon: Box, roles: ['super_admin', 'admin', 'store_manager'] },
    { href: '/admin/stores', label: 'Stores', icon: Store, roles: ['super_admin', 'admin', 'store_manager'] },
    { href: '/admin/users', label: 'Users', icon: Users, roles: ['super_admin'] },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText, roles: ['super_admin'] },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold shrink-0">
                  {(session.user?.name ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{session.user?.name ?? 'Staff'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
            <nav className="p-3 space-y-1">
              {visibleNav.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                prefetch={false}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Customer Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10"
              >
                Logout
              </button>
            </nav>
          </div>
        </aside>
        <main className="lg:col-span-3 min-w-0">{children}</main>
      </div>
    </div>
  );
}
