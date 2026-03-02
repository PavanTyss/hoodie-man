/**
 * Helpers for CSV export from list APIs.
 * Reuse list API query params; when format=csv, return CSV with same filters/sort.
 */

/**
 * Escape a CSV cell (wrap in quotes if contains comma, quote, or newline).
 */
function escapeCsvCell(value: unknown): string {
  if (value == null) return '';
  const s = String(value);
  if (/[,"\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Turn an array of objects into a CSV string. Uses first object's keys as header.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const header = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(row[c.key])).join(',')
  );
  return [header, ...lines].join('\r\n');
}

/**
 * Trigger CSV download from an API URL (e.g. list endpoint with format=csv).
 * Uses fetch with credentials so auth cookies are sent.
 */
export async function downloadCsvFromUrl(url: string, filename: string): Promise<void> {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
