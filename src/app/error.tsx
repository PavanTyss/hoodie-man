'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="bg-error/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-error">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Something Went Wrong
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re
            working on a fix!
          </p>
          {error.message && (
            <div className="bg-card border border-border rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-muted-foreground font-mono">{error.message}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="button"
            size="lg"
            onClick={reset}
            className="gap-2"
          >
            <RefreshCcw className="h-5 w-5" />
            Try Again
          </Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg rounded-lg border-2 border-border bg-transparent text-foreground font-semibold hover:bg-muted transition"
          >
            <Home className="h-5 w-5" />
            Go Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>
            If this problem persists, please{' '}
            <Link href="/contact" className="text-primary hover:underline">
              contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
