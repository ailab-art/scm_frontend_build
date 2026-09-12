// Each content type gets an expert-persona framing sentence baked into its
// base prompt, plus an illustrative model assignment. Real model choice
// (including which image-generation service, if any) is still an open item
// from the contract (Section 3.2) — these are placeholders for that
// eventual routing/vendor decision, not a final choice.
export const CONTENT_TYPES = [
  {
    id: 'video_script',
    label: 'Video script',
    model: 'Claude Sonnet (long-form)',
    outputKind: 'text',
    basePrompt: (name) =>
      `Assume you are an expert SAP EWM architect with strong skills in writing AI video-generation prompts and training scripts. Write a 2-minute video script explaining "${name}" for SAP EWM trainees.`,
  },
  {
    id: 'mcq',
    label: 'MCQ',
    model: 'Claude Haiku (fast/structured)',
    outputKind: 'text',
    basePrompt: (name) =>
      `Assume you are an expert SAP EWM instructional designer skilled at writing assessment questions. Write one multiple-choice question testing understanding of "${name}".`,
  },
  {
    id: 'scenario',
    label: 'Scenario',
    model: 'Claude Sonnet (reasoning)',
    outputKind: 'text',
    basePrompt: (name) =>
      `Assume you are an expert SAP EWM business consultant skilled at writing real-world scenarios. Write a real-world business scenario involving "${name}" in a manufacturing warehouse.`,
  },
  {
    id: 'image_prompt',
    label: 'Photo',
    model: 'Image model — pending decision',
    outputKind: 'image',
    basePrompt: (name) =>
      `Assume you are an expert graphic designer skilled at writing AI image-generation prompts. Create an image illustrating "${name}" in a SAP EWM warehouse context.`,
  },
  {
    id: 'social_post',
    label: 'LinkedIn post',
    model: 'Claude Sonnet + image model — pending decision',
    outputKind: 'image+caption',
    basePrompt: (name) =>
      `Assume you are an expert social media content creator skilled at writing engaging LinkedIn posts. Create a LinkedIn post — an image plus a caption — explaining why "${name}" matters.`,
  },
  {
    id: 'swim_lane',
    label: 'Swim lane',
    model: 'Diagram model — pending decision',
    outputKind: 'diagram',
    basePrompt: (name) =>
      `Assume you are an expert business process architect skilled at documenting SAP EWM process flows. Describe the swim-lane process flow for "${name}".`,
  },
];