import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SLA_DAYS, LEVEL1_REVIEWER, LEVEL2_REVIEWER } from '@/lib/review';

// Kicks off Section 5: Level 1 and Level 2 both start their 20-day clocks
// concurrently on submission (per 5.3 — they run in parallel unless Level 1
// explicitly blocks, which isn't modeled here yet).
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { documentId } = await request.json();
  if (!documentId) return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });

  const now = new Date();
  const deadline = new Date(now.getTime() + SLA_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('documents')
    .update({
      status: 'level1_review',
      level1_reviewer: LEVEL1_REVIEWER,
      level1_status: null,
      level1_submitted_at: now.toISOString(),
      level1_deadline: deadline,
      level2_reviewer: LEVEL2_REVIEWER,
      level2_status: null,
      level2_submitted_at: now.toISOString(),
      level2_deadline: deadline,
      updated_at: now.toISOString(),
    })
    .eq('id', documentId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ document: data });
}