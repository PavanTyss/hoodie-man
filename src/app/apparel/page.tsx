import { Suspense } from 'react';
import CategoryProducts from '@/components/CategoryProducts';
import { getProductsByCategoryFromDB } from '@/lib/api';

export const revalidate = 60;

export default async function ApparelPage() {
  const initial = await getProductsByCategoryFromDB('apparel', {
    limit: 12,
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-muted-foreground">Loading…</div>}>
      <CategoryProducts category="apparel" initialData={initial} />
    </Suspense>
  );
}
