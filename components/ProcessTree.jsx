'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { statusForDomain, acceptedCountForMain, STATUS_CLASSES } from '@/lib/status';

export default function ProcessTree({ mainObjectsForLevel, selectedMainId, selectedSubId, domain, onSelectMain, onSelectSub }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(selectedMainId ? [selectedMainId] : []));

  // Collapse back to a clean slate whenever the underlying set of main
  // objects changes (i.e. the level tab switched) — main object ids are
  // unique across levels so stale ids wouldn't visually break anything, but
  // resetting keeps "Expand all" meaning what it says for the level you're
  // actually looking at.
  useEffect(() => {
    setExpandedIds(new Set(selectedMainId ? [selectedMainId] : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainObjectsForLevel.map((m) => m.id).join(',')]);

  const allExpanded = mainObjectsForLevel.length > 0 && mainObjectsForLevel.every((mo) => expandedIds.has(mo.id));

  function toggleOne(mo) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(mo.id)) next.delete(mo.id);
      else next.add(mo.id);
      return next;
    });
    onSelectMain(mo.id);
  }

  function toggleAll() {
    setExpandedIds(allExpanded ? new Set() : new Set(mainObjectsForLevel.map((mo) => mo.id)));
  }

  return (
    <div className="px-2 pb-4">
      <div className="flex justify-end px-1 pb-2">
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-ink px-2 py-1 rounded-md hover:bg-surface-hover transition-colors"
        >
          {allExpanded ? <ChevronsDownUp className="w-3.5 h-3.5" /> : <ChevronsUpDown className="w-3.5 h-3.5" />}
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {mainObjectsForLevel.map((mo, idx) => {
        const isExpanded = expandedIds.has(mo.id);
        const accepted = acceptedCountForMain(mo);
        return (
          <div key={mo.id} className="animate-lia-fade" style={{ animationDelay: `${idx * 18}ms` }}>
            <button
              onClick={() => toggleOne(mo)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors ${isExpanded ? 'bg-surface-hover' : 'hover:bg-surface'}`}
            >
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                  isExpanded ? 'border-accent text-accent' : 'border-border-strong text-faint'
                }`}
              >
                {isExpanded ? <Minus className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
              </span>
              <span className="text-xs w-5 flex-shrink-0 font-mono text-faint">{String(mo.id).padStart(2, '0')}</span>
              <span className="flex-1 text-sm truncate">{mo.name}</span>
              <span className="text-xs flex-shrink-0 font-mono text-faint">{accepted}/{mo.subObjects.length}</span>
            </button>

            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <div className="ml-6 pl-3.5 border-l border-border flex flex-col gap-0.5 py-0.5 mb-1">
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