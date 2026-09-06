import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Placeholder content generators, keyed by content type. Swap this whole
// block for a call to the Railway generation service once it exists, e.g.:
//
//   const res = await fetch(`${process.env.GENERATION_SERVICE_URL}/generate`, {
//     method: 'POST',
//     headers: { Authorization: `Bearer ${process.env.GENERATION_SERVICE_KEY}` },
//     body: JSON.stringify({ subObjectId, subName, domain, type }),
//   });
//   const content = await res.json();
//
// Everything else in this route (auth check, the Supabase write, the shape
// of the response) stays the same either way.
const SAMPLE_GENERATORS = {
  video_script: (subName) =>
    `"In today's module, we're breaking down ${subName.toLowerCase()} inside SAP EWM. By the end of this two-minute walkthrough, you'll know exactly which configuration steps matter and why."`,
  mcq: (subName) => ({
    question: `Which statement best describes "${subName}"?`,
    options: [
      'Handled entirely by ERP, not EWM',
      'Configured through EWM master data and process types',
      'Only relevant to the Pharma domain',
      'Deprecated in current EWM releases',
    ],
    correct: 1,
  }),
  scenario: (subName) =>
    `A warehouse supervisor needs to validate ${subName.toLowerCase()} during peak inbound volume. Walk through how the system behaves end to end, including any manual intervention points.`,
  image_prompt: (subName) =>
    `"Warehouse operator working with a handheld scanner near labeled storage racks, natural light, editorial photography style — themed around ${subName.toLowerCase()}."\n\n#SAPEWM #WarehouseTech #SupplyChain`,
  social_post: (subName) =>
    `"Most teams underestimate how much ${subName.toLowerCase()} affects downstream accuracy. Here's the 60-second breakdown 👇"`,
  swim_lane: () => ({ note: 'rendered client-side from the sample diagram' }),
};

export async function POST(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { subObjectId, subName, domain, type } = await request.json();
  const generator = SAMPLE_GENERATORS[type];
  if (!subObjectId || !domain || !generator) {
    return NextResponse.json({ error: 'Missing or unknown content type' }, { status: 400 });
  }

  const content = generator(subName);

  const { data, error } = await supabase
    .from('generated_assets')
    .upsert(
      { sub_object_id: subObjectId, domain, type, content, status: 'draft' },
      { onConflict: 'sub_object_id,domain,type' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ asset: data });
}
