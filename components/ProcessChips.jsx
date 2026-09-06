'use client';

import { statusForDomain, STATUS_CLASSES } from '@/lib/status';

// Shared "pick which sub-object" row shown inside a tile's popup, across all
// three tabs — keeps the chip styling and status dots consistent everywhere.
export default function ProcessChips({ subObjects, selectedSubId, domain, onSelectSub }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {subObjects.map((sub) => {
        const status = statusForDomain(sub, domain);
        const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.draft;
        const active = selectedSubId === sub.id;
        return (
          <button
            key={sub.id}
            onClick={() => onSelectSub(sub)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors border ${
              active ? 'bg-accent/10 text-accent border-accent' : 'bg-base text-muted border-border'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusClasses.dot}`} />
            {sub.name}
          </button>
        );
      })}
    </div>
  );
}