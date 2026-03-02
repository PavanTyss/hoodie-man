'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyField?: keyof T | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

/** Semantic table with optional sortable headers, skeleton loading, and empty state. */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data',
  keyField = 'id',
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  const getKey = (row: T, index: number) => {
    const k = keyField as string;
    return String(row[k] ?? (row as { id?: string }).id ?? `row-${index}`);
  };

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm" role="table">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="px-4 py-3 font-medium text-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <span
                      className="inline-block h-5 w-full max-w-[120px] rounded bg-muted animate-pulse"
                      aria-hidden
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm" role="table">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 font-medium text-foreground"
                aria-sort={
                  col.sortable && sortBy === col.key
                    ? sortOrder === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : col.sortable
                      ? 'none'
                      : undefined
                }
              >
                {col.sortable && onSort ? (
                  <button
                    type="button"
                    onClick={() => {
                      const next =
                        sortBy === col.key && sortOrder === 'desc'
                          ? 'asc'
                          : 'desc';
                      onSort(col.key, next);
                    }}
                    className="inline-flex items-center gap-1 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 -mx-1"
                    aria-label={`Sort by ${col.label} ${sortBy === col.key && sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    {col.label}
                    {sortBy === col.key ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="h-4 w-4" aria-hidden />
                      ) : (
                        <ArrowDown className="h-4 w-4" aria-hidden />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={getKey(row, index)}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-foreground">
                    {col.render
                      ? col.render(row)
                      : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
