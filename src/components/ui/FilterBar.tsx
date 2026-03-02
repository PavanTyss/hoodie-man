'use client';

import { ReactNode } from 'react';

export interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

/** Composable row of filter controls (dropdowns, search, date range). */
export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Filters"
      className={`flex flex-wrap items-end gap-4 ${className}`}
    >
      {children}
    </div>
  );
}
