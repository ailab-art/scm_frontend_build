'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { statusForDomain, acceptedCountForMain, STATUS_CLASSES } from '@/lib/status';

export default function ProcessTree({ mainObjectsForLevel, selectedMainId, selectedSubId, domain, onSelectMain, onSelectSub }) {
  const [expandedId, setExpandedId] = useState(selectedMainId || null);

  // Keep the accordion in sync when selection changes externally — e.g. the
  // level pill resets `main` to null in the URL, which should collapse this
  // tree rather than leaving a stale item expanded from the previous level.
  useEffect(() => {
    setExpandedId(selectedMainId || null);
  }, [selectedMainId]);

  function toggle(mo) {
    setExpandedId((prev) => (prev === mo.id ? null : mo.id));
    onSelectMain(mo.id);
  }

  return (
    <div className="px-2 pb-4">
      {mainObjectsForLevel.map((mo, idx) => {
        const isExpanded = expandedId === mo.id;
        const accepted = acceptedCountForMain(mo);
        return (
          <div key={mo.id} className="animate-lia-fade" style={{ animationDelay: `${idx * 18}ms` }}>
            <button
              onClick={() => toggle(mo)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors ${isExpanded ? 'bg-surface-hover' : 'hover:bg-surface'}`}
            >
              <span className="text-xs w-5 flex-shrink-0 font-mono text-faint">{String(mo.id).padStart(2, '0')}</span>
              <span className="flex-1 text-sm truncate">{mo.name}</span>
              <span className="text-xs flex-shrink-0 font-mono text-faint">{accepted}/{mo.subObjects.length}</span>
              <ChevronDown
                className="w-3.5 h-3.5 flex-shrink-0 text-faint transition-transform duration-200"
                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <div className="pl-9 pr-2 pb-1 pt-0.5 flex flex-col gap-0.5">
                  {mo.subObjects.map((sub) => {
                    const status = statusForDomain(sub, domain);
                    const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.draft;
                    const active = selectedSubId === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => onSelectSub(mo.id, sub.id)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-left text-xs transition-colors border-l-2 ${
                          active ? 'bg-accent/10 text-ink border-accent' : 'text-muted border-transparent hover:bg-surface'
                        }`}
                      >
                        <span className={`relative flex-shrink-0 w-1.5 h-1.5 rounded-full ${statusClasses.dot}`}>
                          {(status === 'level1_review' || status === 'level2_review') && (
                            <span className="absolute inset-0 rounded-full bg-review animate-lia-ping" />
                          )}
                        </span>
                        <span className="truncate">{sub.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
