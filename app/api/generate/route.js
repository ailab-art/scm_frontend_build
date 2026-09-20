import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CONTENT_TYPES } from '@/lib/content-types';
import { AI_CONFIGURED, modelIdFor, callTextModel, callTextModelJSON, callImageModel } from '@/lib/ai';

// Falls back to the original placeholder generators when no API key is
// configured yet, so a fresh deploy doesn't just error out before anyone's
// added AI_TEXT_API_KEY / AI_IMAGE_API_KEY. Once those are set, every call
// below goes to a real model.
function mockOutput(typeId, subName, prompt) {
  const note = prompt ? `\n\n(Prompt used: "${prompt}")` : '';
  switch (typeId) {
    case 'video_script':
      return `"In today's module, we're breaking down ${subName.toLowerCase()} inside SAP EWM. By the end of this two-minute walkthrough, you'll know exactly which configuration steps matter and why."${note}`;
    case 'mcq':
      return {
        question: `Which statement best describes "${subName}"?`,
        options: [
          'Handled entirely by ERP, not EWM',
          'Configured through EWM master data and process types',
          'Only relevant to the Pharma domain',
          'Deprecated in current EWM releases',
        ],
        correct: 1,
        note: prompt ? `Prompt used: "${prompt}"` : undefined,
      };
    case 'scenario':
      return `A warehouse supervisor needs to validate ${subName.toLowerCase()} during peak inbound volume. Walk through how the system behaves end to end, including any manual intervention points.${note}`;
    case 'image_prompt':
      return { imageUrl: null, imageDescription: `Warehouse operator using a handheld scanner — themed around ${subName.toLowerCase()}.`, note };
    case 'social_post':
      return {
        imageUrl: null,
        imageDescription: `Editorial-style photo representing ${subName.toLowerCase()} in a modern warehouse.`,
        caption: `Most teams underestimate how much ${subName.toLowerCase()} affects downstream accuracy. Here's the 60-second breakdown 👇`,
        note,
      };
    case 'swim_lane':
      return { note: 'rendered client-side from the sample diagram' };
    default:
      return null;
  }
}

async function realOutput(typeId, subName, prompt) {
  const contentType = CONTENT_TYPES.find((c) => c.id === typeId);
  const modelId = modelIdFor(typeId);

  if (typeId === 'mcq') {
    const result = await callTextModelJSON(modelId, prompt);
    return result.parseError
      ? { question: 'Model returned unparseable output', options: [result.raw], correct: 0 }
      : result;
  }
  if (typeId === 'video_script' || typeId === 'scenario') {
    return await callTextModel(modelId, prompt);
  }
  if (typeId === 'image_prompt') {
    const imageUrl = await callImageModel(modelId, prompt);
    return { imageUrl, imageDescription: prompt };
  }
  if (typeId === 'social_post') {
    const [caption, imageUrl] = await Promise.all([
      callTextModel(modelId, prompt),
      callImageModel(contentType.imageModelId, `Editorial photo for a LinkedIn post about ${subName}`),
    ]);
    return { imageUrl, caption, imageDescription: `Editorial photo representing ${subName}` };
  }
  if (typeId === 'swim_lane') {
    const description = await callTextModel(modelId, prompt);
    return { note: description };
  }
  return null;
}

export async function POST(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { subObjectId, subName, domain, type, prompt } = await request.json();
  const contentType = CONTENT_TYPES.find((c) => c.id === type);
  if (!subObjectId || !domain || !contentType) {
    return NextResponse.json({ error: 'Missing or unknown content type' }, { status: 400 });
  }

  const needsImage = contentType.kind === 'image' || contentType.kind === 'image+caption';
  const configured = contentType.kind === 'image' ? AI_CONFIGURED.image : AI_CONFIGURED.text && (!needsImage || AI_CONFIGURED.image);

  let content;
  let usedMock = false;
  try {
    content = configured ? await realOutput(type, subName, prompt) : mockOutput(type, subName, prompt);
    usedMock = !configured;
  } catch (err) {
    // Real call failed (bad key, rate limit, provider outage) — fall back to
    // the mock rather than losing the request entirely, but say so plainly.
    console.error('generation error, falling back to mock:', err.message);
    content = mockOutput(type, subName, prompt);
    usedMock = true;
  }

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

  return NextResponse.json({ asset: data, model: usedMock ? `${contentType.model} (placeholder — not configured)` : contentType.model });
}