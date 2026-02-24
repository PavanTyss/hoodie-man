'use client';

import { useState, useEffect } from 'react';
import { useThrottledCallback } from '@/hooks/useThrottle';
import { ArrowUp } from 'lucide-react';

const SCROLL_THRESHOLD = 400;
const THROTTLE_MS = 150;

/**
 * Floating "back to top" button, visible after user scrolls down.
 * Uses throttled scroll listener for performance.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  const checkScroll = useThrottledCallback(() => {
    setVisible(window.scrollY > SCROLL_THRESHOLD);
  }, THROTTLE_MS);

  useEffect(() => {
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll(); // initial check
    return () => window.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
