import { Suspense } from 'react';
import { getTree } from '@/lib/get-tree';
import MelaView from '@/components/MelaView';

export default async function MelaPage() {
  const tree = await getTree();
  return (
    <Suspense fallback={<div className="text-sm text-faint">Loading…</div>}>
      <MelaView tree={tree} />
    </Suspense>
  );
}
