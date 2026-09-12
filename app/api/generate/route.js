import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CONTENT_TYPES } from '@/lib/content-types';

// Placeholder content generators, keyed by content type. Swap this whole
// block for a real call to the Railway generation service once it exists.
// The `prompt` received here is already the full combined prompt (fixed
// expert-persona base + the user's optional extra instructions, joined by
// ChetakChat before it ever reaches this route) — this route doesn't need
// to know about that split, it just uses whatever prompt string it's given.
//
// image_prompt and social_post return an { imageDescription, caption? }
// shape rather than plain text, since those are meant to produce an actual
// image — there's no real image model wired up yet, so GeneratedOutput
// renders these as a clearly-labeled placeholder instead of a real photo.
function withPromptNote(base, prompt) {
  return prompt ? `${base}\n\n(Prompt used: "${prompt}")` : base;
}

const SAMPLE_GENERATORS = {
  video_script: (subName, prompt) =>
    withPromptNote(
      `"In today's module, we're breaking down ${subName.toLowerCase()} inside SAP EWM. By the end of this two-minute walkthrough, you'll know exactly which configuration steps matter and why."`,
      prompt
    ),
  mcq: (subName, prompt) => ({
    question: `Which statement best describes "${subName}"?`,
    options: [
      'Handled entirely by ERP, not EWM',
      'Configured through EWM master data and process types',
      'Only relevant to the Pharma domain',
      'Deprecated in current EWM releases',
    ],
    correct: 1,
    note: prompt ? `Prompt used: "${prompt}"` : undefined,
  }),
  scenario: (subName, prompt) =>
    withPromptNote(
      `A warehouse supervisor needs to validate ${subName.toLowerCase()} during peak inbound volume. Walk through how the system behaves end to end, including any manual intervention points.`,
      prompt
    ),
  image_prompt: (subName, prompt) => ({
    imageDescription: `Warehouse operator using a handheld scanner near labeled storage racks, editorial photography style — themed around ${subName.toLowerCase()}.`,
    note: prompt ? `Prompt used: "${prompt}"` : undefined,
  }),
  social_post: (subName, prompt) => ({
    imageDescription: `Editorial-style photo representing ${subName.toLowerCase()} in a modern warehouse.`,
    caption: `Most teams underestimate how much ${subName.toLowerCase()} affects downstream accuracy. Here's the 60-second breakdown 👇`,
    note: prompt ? `Prompt used: "${prompt}"` : undefined,
  }),
  swim_lane: () => ({ note: 'rendered client-side from the sample diagram' }),
};

export async function POST(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { subObjectId, subName, domain, type, prompt } = await request.json();
  const generator = SAMPLE_GENERATORS[type];
  if (!subObjectId || !domain || !generator) {
    return NextResponse.json({ error: 'Missing or unknown content type' }, { status: 400 });
  }

  const content = generator(subName, prompt);
  const model = CONTENT_TYPES.find((c) => c.id === type)?.model || 'unassigned';

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

  return NextResponse.json({ asset: data, model });
}