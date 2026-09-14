import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LEVEL1_REVIEWER, LEVEL2_REVIEWER } from '@/lib/review';

export async function GET(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  if (!documentId) return NextResponse.json({ error: 'Missing documentId' }, { status: 400 });

  const { data, error } = await supabase
    .from('review_comments')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data });
}

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { documentId, level, section, kind, body } = await request.json();
  if (!documentId || ![1, 2].includes(level) || !section || !['comment', 'suggestion'].includes(kind) || !body?.trim()) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const reviewer = level === 1 ? LEVEL1_REVIEWER : LEVEL2_REVIEWER;

  const { data, error } = await supabase
    .from('review_comments')
    .insert({ document_id: documentId, level, section, kind, body: body.trim(), reviewer })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}