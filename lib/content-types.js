// Each content type has a display `model` label (shown in the UI) and a real
// `modelId` (the actual API model string used in lib/ai.js). modelId can be
// overridden per type via an AI_MODEL_<TYPE> env var without a code change —
// useful for testing against a free model before paying for real Grok usage.
// Persona framing lives in basePrompt, fixed and shown read-only in the UI;
// the user's optional extra instructions get appended at send time.
export const CONTENT_TYPES = [
  {
    id: 'video_script',
    label: 'Video script',
    model: 'Grok 4.6',
    modelId: 'grok-4.6',
    kind: 'text',
    basePrompt: (name) =>
      `Assume you are an expert SAP EWM architect with strong skills in writing AI video-generation prompts and training scripts. Write a 2-minute video script explaining "${name}" for SAP EWM trainees.`,
  },
  {
    id: 'mcq',
    label: 'MCQ',
    model: 'Grok 4.1 Fast',
    modelId: 'grok-4.1-fast',
    kind: 'json',
    basePrompt: (name) =>
      `Assume you are an expert SAP EWM instructional designer skilled at writing assessment questions. Write one multiple-choice question testing understanding of "${name}". Return JSON: {"question": string, "options": [string, string, string, string], "correct": number (0-3 index of the correct option)}.`,
  },
  {
    id: 'scenario',
    label: 'Scenario',
    model: 'Grok 4.3',
    modelId: 'grok-4.3',
    kind: 'text',
    basePrompt: (name) =>
      `Assume you are an expert SAP EWM business consultant skilled at writing real-world scenarios. Write a real-world business scenario involving "${name}" in a manufacturing warehouse.`,
  },
  {
    id: 'image_prompt',
    label: 'Photo',
    model: 'Grok Imagine Image 2.0',
    modelId: 'grok-imagine-image-2.0',
    kind: 'image',
    basePrompt: (name) =>
      `A photorealistic editorial image illustrating "${name}" in a SAP EWM warehouse context. Clean composition, natural lighting, no text overlays.`,
  },
  {
    id: 'social_post',
    label: 'LinkedIn post',
    model: 'Grok 4.3 + Grok Imagine Image 2.0',
    modelId: 'grok-4.3',
    imageModelId: 'grok-imagine-image-2.0',
    kind: 'image+caption',
    basePrompt: (name) =>
      `Assume you are an expert social media content creator skilled at writing engaging LinkedIn posts. Write ONLY the caption text (no markdown, no quotes) for a LinkedIn post explaining why "${name}" matters.`,
  },
  {
    id: 'swim_lane',
    label: 'Swim lane',
    model: 'Grok 4.3',
    modelId: 'grok-4.3',
    kind: 'diagram',
    basePrompt: (name) =>
      `Assume you are an expert business process architect skilled at documenting SAP EWM process flows. Describe the swim-lane process flow for "${name}".`,
  },
];