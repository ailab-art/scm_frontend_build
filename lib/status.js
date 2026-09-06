// Central helpers for deriving display status from real `documents` rows.
// A sub-object can have 1 document (Standard) or 2 (Manufacturing + Pharma).

export function docForDomain(sub, domain) {
  if (!sub.documents || sub.documents.length === 0) return null;
  return sub.documents.find((d) => d.domain === domain) || sub.documents[0];
}

export function statusForDomain(sub, domain) {
  return docForDomain(sub, domain)?.status || 'draft';
}

export function acceptedCountForMain(mainObject) {
  return mainObject.subObjects.filter((s) =>
    (s.documents || []).some((d) => d.status === 'accepted')
  ).length;
}

export const STATUS_LABEL = {
  accepted: 'Accepted',
  level2_review: 'In review',
  level1_review: 'In review',
  draft: 'Draft',
};

// Full, literal Tailwind class strings — never build these with template
// interpolation (e.g. `bg-${color}`). Tailwind's content scanner only picks
// up class names it can see written out in full in a scanned file; a
// dynamically-assembled string never appears literally, so the utility
// silently never gets generated in the production build.
export const STATUS_CLASSES = {
  accepted: { dot: 'bg-accepted', badge: 'bg-accepted/10 text-accepted' },
  level1_review: { dot: 'bg-review', badge: 'bg-review/10 text-review' },
  level2_review: { dot: 'bg-review', badge: 'bg-review/10 text-review' },
  draft: { dot: 'bg-draft', badge: 'bg-draft/10 text-draft' },
};
