'use client';

import { ChevronDown } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

export interface SortDropdownProps {
  options: SortOption[];
  value: string;
  order: 'asc' | 'desc';
  onChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  label?: string;
  id?: string;
}

/** Sort by field + order dropdown. Accessible and keyboard-friendly. */
export function SortDropdown({
  options,
  value,
  order,
  onChange,
  label = 'Sort by',
  id = 'sort-dropdown',
}: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-background overflow-hidden">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value, order)}
          className="px-3 py-2 text-sm text-foreground bg-transparent border-r border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset min-w-[120px]"
          aria-label={`${label}: field`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          aria-label={`${label}: order`}
          value={order}
          onChange={(e) =>
            onChange(value, e.target.value as 'asc' | 'desc')
          }
          className="px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <ChevronDown className="h-4 w-4 text-muted-foreground mr-2 pointer-events-none" aria-hidden />
      </div>
    </div>
  );
}
