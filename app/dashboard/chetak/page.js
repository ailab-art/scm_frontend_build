import { Suspense } from 'react';
import { getTree } from '@/lib/get-tree';
import ChetakView from '@/components/ChetakView';

export default async function ChetakPage() {
  const tree = await getTree();
  return (
    <Suspense fallback={<div className="text-sm text-faint">Loading…</div>}>
      <ChetakView tree={tree} />
    </Suspense>
  );
}
