'use client';

import { GitBranch } from 'lucide-react';
import LevelSelector from '@/components/LevelSelector';
import SwimLaneSample from '@/components/SwimLaneSample';
import { useProcessSelection } from '@/lib/use-process-selection';
import { statusForDomain, acceptedCountForMain, STATUS_CLASSES } from '@/lib/status';

export default function MelaView({ tree }) {
  const { level, mainId, subId, domain, setLevel, setMain, setSub } = useProcessSelection();

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;

  return (
    <div>
      <div className="max-w-xs mb-6">
        <LevelSelector level={level} onSelect={setLevel} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {mainObjectsForLevel.map((mo) => {
          const accepted = acceptedCountForMain(mo);
          const active = selectedMain?.id === mo.id;
          return (
            <button
              key={mo.id}
              onClick={() => setMain(mo.id)}
              className={`text-left p-4 rounded-xl transition-colors border ${active ? 'bg-accent/10 border-accent/40' : 'bg-surface border-border'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-base">
                  <GitBranch className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs font-mono text-faint">{accepted}/{mo.subObjects.length}</span>
              </div>
              <div className="text-sm font-medium mb-1">{mo.name}</div>
              <div className="text-xs text-faint">{mo.subObjects.length} process flows</div>
            </button>
          );
        })}
      </div>

      {selectedMain && (
        <div className="rounded-xl p-6 bg-surface border border-border">
          <div className="text-xs uppercase tracking-wider mb-3 text-faint">{selectedMain.name}</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedMain.subObjects.map((sub) => {
              const status = statusForDomain(sub, domain);
              const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.draft;
              const active = selectedSub?.id === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSub(selectedMain.id, sub.id, domain)}
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

          {selectedSub ? (
            <div className="animate-lia-fade">
              <div className="text-sm font-medium mb-4">{selectedSub.name} — sample flow</div>
              <SwimLaneSample />
              <div className="text-xs mt-3 text-faint">
                Illustrative only — AI Chetak will generate the real swim lane once this document is accepted.
              </div>
            </div>
          ) : (
            <div className="text-sm text-faint">Pick a process above to preview its flow.</div>
          )}
        </div>
      )}
    </div>
  );
}
