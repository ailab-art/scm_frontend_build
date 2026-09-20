// Real model calls, kept provider-agnostic on purpose: xAI (Grok), OpenRouter,
// and Google Gemini's OpenAI-compatibility layer all accept the same
// /chat/completions request shape, so switching providers is an env var
// change, not a code change. This matters because xAI has no free tier —
// swap AI_TEXT_BASE_URL/AI_TEXT_API_KEY to a free provider while testing,
// then point them at https://api.x.ai/v1 with a real xAI key when ready to
// pay. Image generation is xAI-specific for now (grok-imagine-image-2.0);
// there's no equivalently-integrated free image model to fall back to.
import { CONTENT_TYPES } from '@/lib/content-types';

const TEXT_BASE_URL = process.env.AI_TEXT_BASE_URL || 'https://api.x.ai/v1';
const TEXT_API_KEY = process.env.AI_TEXT_API_KEY;
const IMAGE_BASE_URL = process.env.AI_IMAGE_BASE_URL || 'https://api.x.ai/v1';
const IMAGE_API_KEY = process.env.AI_IMAGE_API_KEY;

export const AI_CONFIGURED = { text: !!TEXT_API_KEY, image: !!IMAGE_API_KEY };

// Per-type model, overridable per type via AI_MODEL_<TYPE> without touching
// code — e.g. AI_MODEL_MCQ=gemini-2.0-flash while testing for free.
export function modelIdFor(typeId) {
  const envKey = `AI_MODEL_${typeId.toUpperCase()}`;
  return process.env[envKey] || CONTENT_TYPES.find((c) => c.id === typeId)?.modelId;
}

export async function callTextModel(modelId, prompt) {
  const res = await fetch(`${TEXT_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TEXT_API_KEY}` },
    body: JSON.stringify({ model: modelId, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Text model (${modelId}) error ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// Asks for strict JSON, tolerates a model wrapping it in ```json fences
// anyway (common enough that stripping them defensively is worth it),
// and falls back to a visibly-broken-but-non-crashing shape on parse failure
// rather than taking the whole request down.
export async function callTextModelJSON(modelId, prompt) {
  const raw = await callTextModel(
    modelId,
    `${prompt}\n\nRespond with ONLY valid JSON, no markdown code fences, no commentary before or after.`
  );
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { parseError: true, raw: raw.slice(0, 500) };
  }
}

export async function callImageModel(modelId, prompt) {
  const res = await fetch(`${IMAGE_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${IMAGE_API_KEY}` },
    body: JSON.stringify({ model: modelId, prompt, n: 1 }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Image model (${modelId}) error ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.data?.[0]?.url ?? null;
}