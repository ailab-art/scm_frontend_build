import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Uploads a file to Storage and links it to the matching documents row in
// one action — computing storage_path by the same naming convention already
// established (bare index for Standard, index-Domain for variants) so
// there's no manual filename-typing step where the two can drift apart.
export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file');
  const subObjectId = formData.get('subObjectId');
  const domain = formData.get('domain');

  if (!file || !subObjectId || !domain) {
    return NextResponse.json({ error: 'Missing file, subObjectId, or domain' }, { status: 400 });
  }

  const path = domain === 'Standard' ? `${subObjectId}.pdf` : `${subObjectId}-${domain}.pdf`;

  const { error: uploadError } = await supabase.storage.from('documents').upload(path, file, {
    upsert: true,
    contentType: file.type || 'application/pdf',
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data, error: updateError } = await supabase
    .from('documents')
    .update({ storage_path: path, updated_at: new Date().toISOString() })
    .eq('sub_object_id', subObjectId)
    .eq('domain', domain)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ document: data, path });
}