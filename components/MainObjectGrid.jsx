'use client';

import LevelSelector from '@/components/LevelSelector';
import { acceptedCountForMain } from '@/lib/status';

// Shared tile-grid shell used by all three tabs: level pills up top, then one
// card per main object. Only the icon and the count-label text differ
// per tab; clicking a tile is left entirely to the caller (onOpenMain),
// since what "opening" means differs (document viewer vs flow vs chat).
export default function MainObjectGrid({ level, onSelectLevel, mainObjectsForLevel, onOpenMain, icon: Icon, itemLabel = 'sub-objects' }) {
  return (
    <div>
      <div className="max-w-xs mb-6">
        <LevelSelector level={level} onSelect={onSelectLevel} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mainObjectsForLevel.map((mo) => {
          const accepted = acceptedCountForMain(mo);
          return (
            <button
              key={mo.id}
              onClick={() => onOpenMain(mo)}
              className="text-left p-4 rounded-xl transition-colors border bg-surface border-border hover:border-accent/40"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-base">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs font-mono text-faint">{accepted}/{mo.subObjects.length}</span>
              </div>
              <div className="text-sm font-medium mb-1">{mo.name}</div>
              <div className="text-xs text-faint">{mo.subObjects.length} {itemLabel}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}