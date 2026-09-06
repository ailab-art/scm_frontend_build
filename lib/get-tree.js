import { createClient } from '@/lib/supabase/server';

// Server-side fetch of the full content tree: main_objects -> sub_objects -> documents.
// Runs three queries and joins in memory rather than a single nested select,
// since Supabase's PostgREST nested embeds add complexity this skeleton doesn't need yet.
export async function getTree() {
  const supabase = createClient();

  const [
    { data: mainObjects, error: e1 },
    { data: subObjects, error: e2 },
    { data: documents, error: e3 },
    { data: generatedAssets, error: e4 },
  ] = await Promise.all([
    supabase.from('main_objects').select('*').order('sort_order'),
    supabase.from('sub_objects').select('*').order('sort_order'),
    supabase.from('documents').select('*'),
    supabase.from('generated_assets').select('*'),
  ]);

  if (e1 || e2 || e3 || e4) {
    console.error('getTree error', e1, e2, e3, e4);
    return [];
  }

  // Only accepted documents actually need a signed URL — the other ~101
  // drafts don't have a file yet, so skip the Storage round-trip for them.
  // Once most of the 102 have real files, revisit this: generating a signed
  // URL for every accepted doc on every page load won't scale forever, and
  // an on-demand endpoint (sign one URL when a specific doc is opened)
  // would be the next step.
  const documentsWithUrls = await Promise.all(
    (documents || []).map(async (d) => {
      if (d.status !== 'accepted' || !d.storage_path) return { ...d, signed_url: null };
      const { data, error } = await supabase.storage.from('documents').createSignedUrl(d.storage_path, 3600);
      if (error) {
        console.error('signed url error for', d.storage_path, error);
        return { ...d, signed_url: null };
      }
      return { ...d, signed_url: data.signedUrl };
    })
  );

  return (mainObjects || []).map((mo) => ({
    ...mo,
    subObjects: (subObjects || [])
      .filter((s) => s.main_object_id === mo.id)
      .map((s) => ({
        ...s,
        documents: documentsWithUrls.filter((d) => d.sub_object_id === s.id),
        generatedAssets: (generatedAssets || []).filter((a) => a.sub_object_id === s.id),
      })),
  }));
}