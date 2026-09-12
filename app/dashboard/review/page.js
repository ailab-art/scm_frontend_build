import { Suspense } from 'react';
import { getTree } from '@/lib/get-tree';
import ReviewQueueView from '@/components/ReviewQueueView';

export default async function ReviewPage() {
  const tree = await getTree();
  return (
    <Suspense fallback={<div className="text-sm text-faint">Loading…</div>}>
      <ReviewQueueView tree={tree} />
    </Suspense>
  );
}