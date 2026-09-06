import { Suspense } from 'react';
import { getTree } from '@/lib/get-tree';
import DukanView from '@/components/DukanView';

export default async function DukanPage() {
  const tree = await getTree();
  return (
    <Suspense fallback={<div className="text-sm text-faint">Loading…</div>}>
      <DukanView tree={tree} />
    </Suspense>
  );
}
