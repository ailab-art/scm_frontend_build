import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Records a reviewer's decision at a given level. Level 1 approval sets the
// document's overall status to accepted regardless of Level 2 (Section 5.5 —
// milestone billing eligibility depends on Level 1 alone). A revision
// request bumps revision_count; this route does not yet enforce the
// contract's 2-round cap (Section 5.3) or the 10-day/3-day resubmission
// clock — it records the decision correctly, but that stricter cycle is a
// deliberate scope cut for this first version.
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { documentId, level, decision } = await request.json();
  if (!documentId || ![1, 2].includes(level) || !['approved', 'revision_requested'].includes(decision)) {
    return NextResponse.json({ error: 'Missing or invalid documentId/level/decision' }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  const patch = { updated_at: new Date().toISOString() };
  if (level === 1) {
    patch.level1_status = decision;
    if (decision === 'approved') patch.status = 'accepted';
    if (decision === 'revision_requested') {
      patch.status = 'draft';
      patch.revision_count = (existing.revision_count || 0) + 1;
    }
  } else {
    patch.level2_status = decision;
    if (decision === 'revision_requested') {
      patch.revision_count = (existing.revision_count || 0) + 1;
    }
  }

  const { data, error } = await supabase.from('documents').update(patch).eq('id', documentId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}