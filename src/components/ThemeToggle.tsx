'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { ThemeMode } from '@/lib/theme';

/**
 * Theme toggle: light / dark / system.
 * Renders a dropdown or segmented control for theme selection.
 */
export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const modes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-muted/50 p-1"
      role="group"
      aria-label="Theme"
    >
      {modes.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`flex items-center justify-center rounded-md p-1.5 text-sm transition-colors ${
            theme === value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          title={`${label} mode`}
          aria-label={`Use ${label} mode`}
          aria-pressed={theme === value}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
