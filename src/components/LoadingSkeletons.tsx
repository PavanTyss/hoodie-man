export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-64 bg-muted"></div>
      <div className="p-5">
        <div className="h-6 bg-muted rounded mb-2"></div>
        <div className="h-4 bg-muted rounded mb-3 w-3/4"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-6 bg-muted rounded w-16"></div>
        </div>
        <div className="mt-2 flex gap-1">
          <div className="w-4 h-4 rounded-full bg-muted"></div>
          <div className="w-4 h-4 rounded-full bg-muted"></div>
          <div className="w-4 h-4 rounded-full bg-muted"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
