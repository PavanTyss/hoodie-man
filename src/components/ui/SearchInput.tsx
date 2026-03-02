'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export interface SearchInputProps {
  onSearch: (q: string) => void;
  debounceMs?: number;
  placeholder?: string;
  label?: string;
  id?: string;
  defaultValue?: string;
  loading?: boolean;
}

/** Debounced search input. Triggers onSearch after user stops typing. Avoids calling onSearch on every render by only firing when value changes. */
export function SearchInput({
  onSearch,
  debounceMs = 350,
  placeholder = 'Search…',
  label = 'Search',
  id = 'search-input',
  defaultValue = '',
  loading = false,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  const debouncedSearch = useCallback((q: string) => {
    onSearchRef.current(q.trim());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      debouncedSearch(value);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs, debouncedSearch]);

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          aria-label={label}
          autoComplete="off"
        />
        {loading && (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
