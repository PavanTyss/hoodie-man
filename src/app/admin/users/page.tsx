'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Download, Trash2, User } from 'lucide-react';
import Input from '@/components/ui/Input';
import { downloadCsvFromUrl } from '@/lib/csv-export';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import Button from '@/components/ui/Button';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  _count?: { orders: number };
}

const ROLES = ['super_admin', 'admin', 'store_manager', 'delivery_agent', 'user'] as const;

const SORT_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Date' },
  { value: 'role', label: 'Role' },
];

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All roles' },
  ...ROLES.map((r) => ({ value: r, label: r.replace('_', ' ') })),
];

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const role = (session?.user as { role?: string })?.role ?? '';
  const currentUserId = (session?.user as { id?: string })?.id ?? '';
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const loadingRef = useRef(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'admin' | 'store_manager' | 'delivery_agent'>('admin');
  const [submitting, setSubmitting] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const roleFilter = searchParams.get('role') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
  const q = searchParams.get('q') ?? '';

  const setParams = useCallback(
    (updates: Record<string, string | number>) => {
      const p = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === '' || v === undefined) p.delete(k);
        else p.set(k, String(v));
      });
      if (p.get('page') === '1') p.delete('page');
      const newSearch = p.toString();
      const currentSearch = pathname === '/admin/users' ? searchParams.toString() : '';
      if (newSearch !== currentSearch) {
        router.replace(`/admin/users${newSearch ? `?${newSearch}` : ''}`);
      }
    },
    [searchParams, router, pathname]
  );

  const handleExportCsv = useCallback(() => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set('format', 'csv');
    if (roleFilter) params.set('role', roleFilter);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    downloadCsvFromUrl(`/api/admin/super/users?${params}`, 'users.csv').finally(() => setExporting(false));
  }, [roleFilter, sortBy, sortOrder, q]);

  const load = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    if (roleFilter) params.set('role', roleFilter);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    fetch(`/api/admin/super/users?${params}`)
      .then((res) =>
        res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      )
      .then((data) => {
        setUsers(data.items ?? data.users ?? []);
        setPagination(
          data.pagination ?? { page: 1, limit: 20, total: data.items?.length ?? 0, totalPages: 1 }
        );
      })
      .catch(() => {
        setUsers([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .finally(() => {
        loadingRef.current = false;
        setLoading(false);
      });
  }, [page, roleFilter, sortBy, sortOrder, q]);

  // Only fetch when we're on the list route (not on /admin/users/[id] or /admin/users/[id]/scopes)
  const isListPage = pathname === '/admin/users';
  useEffect(() => {
    if (role !== 'super_admin' || !isListPage) return;
    load();
  }, [role, isListPage, load]);

  const handleDeleteUser = useCallback(async (userId: string, email: string) => {
    if (userId === currentUserId) return;
    if (!confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/super/users/${userId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete');
        return;
      }
      toast.success('User deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  }, [currentUserId, load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword) {
      toast.error('Email and password required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/super/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail.trim(),
          name: createName.trim() || undefined,
          password: createPassword,
          role: createRole,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create user');
        return;
      }
      toast.success('User created');
      setShowCreate(false);
      setCreateEmail('');
      setCreateName('');
      setCreatePassword('');
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/super/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to update role');
        return;
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  if (role !== 'super_admin') {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground">You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">Users</h1>
          <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
            <Plus className="h-4 w-4" /> Add user
          </button>
        </div>
        <FilterBar>
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-foreground mb-1">
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setParams({ role: e.target.value, page: 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground min-w-[140px]"
              aria-label="Filter by role"
            >
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px]">
            <SearchInput
              key={q}
              label="Search"
              placeholder="Email, name…"
              defaultValue={q}
              onSearch={(value) => setParams({ q: value, page: 1 })}
            />
          </div>
          <SortDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            order={sortOrder}
            onChange={(by, order) => setParams({ sortBy: by, sortOrder: order })}
          />
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={exporting} className="gap-2">
            <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </FilterBar>
      </div>
      {showCreate && (
        <form onSubmit={handleCreate} className="p-6 border-b border-border bg-muted/30 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={createEmail}
            onChange={(e) => setCreateEmail(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background"
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-border bg-background"
          />
          <Input
            type="password"
            placeholder="Password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
            className="max-w-xs"
            showPasswordToggle
          />
          <select
            value={createRole}
            onChange={(e) => setCreateRole(e.target.value as 'admin' | 'store_manager' | 'delivery_agent')}
            className="px-3 py-2 rounded-lg border border-border bg-background"
          >
            <option value="admin">Admin</option>
            <option value="store_manager">Store Manager</option>
            <option value="delivery_agent">Delivery Agent</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
              Create
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-border">
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="animate-pulse">Loading…</span>
          </div>
        ) : (
          <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-foreground">Email</th>
                <th className="text-left p-4 font-medium text-foreground">Name</th>
                <th className="text-left p-4 font-medium text-foreground">Role</th>
                <th className="text-left p-4 font-medium text-foreground">Created</th>
                <th className="text-left p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-4 text-foreground">{u.email}</td>
                  <td className="p-4 text-muted-foreground">{u.name ?? '—'}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary capitalize">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {u.id !== currentUserId && (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-sm px-2 py-1 rounded border border-border bg-background text-foreground"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r.replace('_', ' ')}</option>
                          ))}
                        </select>
                      )}
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <User className="h-3.5 w-3.5" /> View
                      </Link>
                      {u.role === 'admin' && (
                        <Link
                          href={`/admin/users/${u.id}/scopes`}
                          className="text-sm text-primary hover:underline"
                        >
                          Scopes
                        </Link>
                      )}
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="text-sm text-red-600 hover:underline inline-flex items-center gap-1"
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setParams({ page: pagination.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setParams({ page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}
