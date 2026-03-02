'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { downloadCsvFromUrl } from '@/lib/csv-export';
import { FilterBar } from '@/components/ui/FilterBar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SortDropdown } from '@/components/ui/SortDropdown';
import Button from '@/components/ui/Button';

interface LogRow {
  id: string;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
}

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date' },
  { value: 'action', label: 'Action' },
  { value: 'entityType', label: 'Entity type' },
];

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = (session?.user as { role?: string })?.role ?? '';
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '20', 10)));
  const action = searchParams.get('action') ?? '';
  const entityType = searchParams.get('entityType') ?? '';
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';
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
      router.replace(`/admin/audit-logs${p.toString() ? `?${p.toString()}` : ''}`);
    },
    [searchParams, router]
  );

  const handleExportCsv = useCallback(() => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set('format', 'csv');
    if (action) params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    downloadCsvFromUrl(`/api/admin/super/audit-logs?${params}`, 'audit-logs.csv').finally(() => setExporting(false));
  }, [action, entityType, from, to, sortBy, sortOrder, q]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (action) params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    if (q) params.set('q', q);
    fetch(`/api/admin/super/audit-logs?${params}`)
      .then((res) =>
        res.ok ? res.json() : { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } }
      )
      .then((data) => {
        setLogs(data.items ?? data.logs ?? []);
        setPagination(
          data.pagination ?? { page: 1, limit: 20, total: data.items?.length ?? 0, totalPages: 1 }
        );
      })
      .catch(() => {
        setLogs([]);
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [page, limit, action, entityType, from, to, sortBy, sortOrder, q]);

  useEffect(() => {
    if (role !== 'super_admin') return;
    // Data fetch: load() triggers setState in async callbacks (valid pattern)
    load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [role, load]);

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
        <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Recent sensitive actions</p>
        <FilterBar className="mt-4 flex-wrap gap-4">
          <div>
            <label htmlFor="action-filter" className="block text-sm font-medium text-foreground mb-1">
              Action
            </label>
            <input
              id="action-filter"
              type="text"
              placeholder="Action"
              value={action}
              onChange={(e) => setParams({ action: e.target.value, page: 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm w-40"
              aria-label="Filter by action"
            />
          </div>
          <div>
            <label htmlFor="entity-type" className="block text-sm font-medium text-foreground mb-1">
              Entity type
            </label>
            <select
              id="entity-type"
              value={entityType}
              onChange={(e) => setParams({ entityType: e.target.value, page: 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              aria-label="Filter by entity type"
            >
              <option value="">All types</option>
              <option value="user">user</option>
              <option value="store">store</option>
              <option value="order">order</option>
              <option value="product">product</option>
            </select>
          </div>
          <div>
            <label htmlFor="from-date" className="block text-sm font-medium text-foreground mb-1">
              From
            </label>
            <input
              id="from-date"
              type="date"
              value={from}
              onChange={(e) => setParams({ from: e.target.value, page: 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              aria-label="From date"
            />
          </div>
          <div>
            <label htmlFor="to-date" className="block text-sm font-medium text-foreground mb-1">
              To
            </label>
            <input
              id="to-date"
              type="date"
              value={to}
              onChange={(e) => setParams({ to: e.target.value, page: 1 })}
              className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
              aria-label="To date"
            />
          </div>
          <div className="min-w-[200px]">
            <SearchInput
              key={q}
              label="Search"
              placeholder="Entity ID, actor…"
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
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
            <span className="animate-pulse">Loading…</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No audit logs yet.</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 font-medium text-foreground">Time</th>
                  <th className="text-left p-4 font-medium text-foreground">Actor</th>
                  <th className="text-left p-4 font-medium text-foreground">Action</th>
                  <th className="text-left p-4 font-medium text-foreground">Entity</th>
                  <th className="text-left p-4 font-medium text-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border">
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm">{log.actorEmail ?? '—'}</td>
                    <td className="p-4 text-sm font-medium">{log.action}</td>
                    <td className="p-4 text-sm">
                      {log.entityType} #{log.entityId.slice(0, 8)}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                      {log.details}
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
