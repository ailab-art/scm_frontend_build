// Each content type gets an illustrative model assignment and a starter
// prompt template. Real model choice is still an open item from the
// contract (Section 3.2 — client decides based on cost/accuracy analysis);
// this mapping is a placeholder for that eventual routing logic, not a
// final decision.
export const CONTENT_TYPES = [
  {
    id: 'video_script',
    label: 'Video script',
    model: 'Claude Sonnet (long-form)',
    promptTemplate: (name) => `Write a 2-minute video script explaining "${name}" for SAP EWM trainees.`,
  },
  {
    id: 'mcq',
    label: 'MCQ',
    model: 'Claude Haiku (fast/structured)',
    promptTemplate: (name) => `Write one multiple-choice question testing understanding of "${name}".`,
  },
  {
    id: 'scenario',
    label: 'Scenario',
    model: 'Claude Sonnet (reasoning)',
    promptTemplate: (name) => `Write a real-world business scenario involving "${name}" in a manufacturing warehouse.`,
  },
  {
    id: 'image_prompt',
    label: 'Image prompt',
    model: 'Claude Haiku (short-form)',
    promptTemplate: (name) => `Write an image-generation prompt, plus hashtags and a caption, illustrating "${name}".`,
  },
  {
    id: 'social_post',
    label: 'Social post',
    model: 'Claude Sonnet (brand voice)',
    promptTemplate: (name) => `Draft a LinkedIn post explaining why "${name}" matters, in an engaging tone.`,
  },
  {
    id: 'swim_lane',
    label: 'Swim lane',
    model: 'Claude Sonnet (structured)',
    promptTemplate: (name) => `Describe the swim-lane process flow for "${name}".`,
  },
];