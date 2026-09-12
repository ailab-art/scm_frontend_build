'use client';

import { useState } from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';
import Modal from '@/components/Modal';
import ProcessChips from '@/components/ProcessChips';
import SwimLaneSample from '@/components/SwimLaneSample';
import { useProcessSelection } from '@/lib/use-process-selection';
import { acceptedCountForMain } from '@/lib/status';

const LEVELS = ['Basic', 'Advance', 'Super Advance'];

function defaultDomainFor(sub) {
  const domains = [...new Set((sub.documents || []).map((d) => d.domain))];
  return domains.includes('Manufacturing') ? 'Manufacturing' : domains[0] || 'Standard';
}

function NodeBox({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-4 py-3 rounded-lg border transition-colors min-w-48 ${
        active ? 'bg-accent/10 border-accent' : 'bg-surface border-border hover:border-accent/40'
      }`}
    >
      {children}
    </button>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1.5">
      <ChevronDown className="w-4 h-4 text-faint" />
    </div>
  );
}

// Root structure for the first two tiers (Level -> Main Object), shown
// inline as a drill-down. The third tier (Sub-object -> flow preview) opens
// in a popup instead of a third inline row — picking a sub-object is a
// one-off lookup, not something that benefits from staying expanded on the
// page the way the level/main-object browsing does.
export default function MelaView({ tree }) {
  const { level, mainId, subId, domain, setLevel, setMain, setSub } = useProcessSelection();
  const [modalOpen, setModalOpen] = useState(false);

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;

  function openTile(mo) {
    setMain(mo.id);
    setModalOpen(true);
  }

  function selectChip(sub) {
    setSub(selectedMain.id, sub.id, defaultDomainFor(sub));
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-faint mb-4" style={{ letterSpacing: '0.08em' }}>
        Root structure
      </div>

      <div className="flex flex-wrap gap-3">
        {LEVELS.map((lvl) => (
          <NodeBox key={lvl} active={level === lvl} onClick={() => setLevel(lvl)}>
            <div className="text-sm font-medium">{lvl}</div>
            <div className="text-xs text-faint mt-0.5">{tree.filter((m) => m.level === lvl).length} main objects</div>
          </NodeBox>
        ))}
      </div>

      <Connector />

      <div className="flex flex-wrap gap-3">
        {mainObjectsForLevel.map((mo) => {
          const accepted = acceptedCountForMain(mo);
          return (
            <NodeBox key={mo.id} active={selectedMain?.id === mo.id} onClick={() => openTile(mo)}>
              <div className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <div className="text-sm font-medium">{mo.name}</div>
              </div>
              <div className="text-xs text-faint mt-0.5">{accepted}/{mo.subObjects.length} flows mapped</div>
            </NodeBox>
          );
        })}
      </div>

      <Modal open={modalOpen && !!selectedMain} onClose={() => setModalOpen(false)} title={selectedMain?.name || ''}>
        {selectedMain && (
          <>
            <ProcessChips
              subObjects={selectedMain.subObjects}
              selectedSubId={selectedSub?.id}
              domain={domain}
              onSelectSub={selectChip}
            />
            {selectedSub ? (
              <div>
                <div className="text-sm font-medium mb-4">{selectedSub.name} — sample flow</div>
                <SwimLaneSample />
                <div className="text-xs mt-3 text-faint">
                  Illustrative only — AI Chetak will generate the real swim lane once this document is accepted.
                </div>
              </div>
            ) : (
              <div className="text-sm text-faint">Pick a process above to preview its flow.</div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}