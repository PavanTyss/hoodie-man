'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, User as UserIcon, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role ?? '';
  const currentUserId = (session?.user as { id?: string })?.id ?? '';
  const userId = params?.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (role !== 'super_admin' || !userId) return;
    fetch(`/api/admin/super/users/${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [role, userId]);

  const handleDelete = async () => {
    if (!user || user.id === currentUserId) return;
    if (!confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/super/users/${userId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete');
        return;
      }
      toast.success('User deleted');
      router.push('/admin/users');
    } finally {
      setDeleting(false);
    }
  };

  if (role !== 'super_admin') {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">User not found.</p>
        <Link href="/admin/users" className="mt-4 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <UserIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{user.name ?? user.email}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm mt-1">
                <span className="capitalize">{user.role.replace('_', ' ')}</span>
                {user._count != null && (
                  <span className="text-muted-foreground ml-2">· {user._count.orders ?? 0} orders</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Created {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <Link
                href={`/admin/users/${user.id}/scopes`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-medium"
              >
                Manage scopes
              </Link>
            )}
            {user.id !== currentUserId && (
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30">
                <Trash2 className="h-4 w-4" /> {deleting ? 'Deleting…' : 'Delete user'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
