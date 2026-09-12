'use client';

import { useState } from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';
import Modal from '@/components/Modal';
import SwimLaneSample from '@/components/SwimLaneSample';
import { useProcessSelection } from '@/lib/use-process-selection';
import { statusForDomain, acceptedCountForMain, STATUS_CLASSES } from '@/lib/status';

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

// Root-structure view: a drill-down tree (Level -> Main Object -> Sub-object)
// instead of a flat card grid. Each row is the children of whatever's
// selected in the row above; clicking a sub-object opens its flow in the
// same popup pattern used elsewhere in the app.
export default function MelaView({ tree }) {
  const { level, mainId, subId, domain, setLevel, setMain, setSub } = useProcessSelection();
  const [modalOpen, setModalOpen] = useState(false);

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;

  function openSub(sub) {
    setSub(selectedMain.id, sub.id, defaultDomainFor(sub));
    setModalOpen(true);
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
            <NodeBox key={mo.id} active={selectedMain?.id === mo.id} onClick={() => setMain(mo.id)}>
              <div className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <div className="text-sm font-medium">{mo.name}</div>
              </div>
              <div className="text-xs text-faint mt-0.5">{accepted}/{mo.subObjects.length} flows mapped</div>
            </NodeBox>
          );
        })}
      </div>

      {selectedMain && (
        <>
          <Connector />
          <div className="flex flex-wrap gap-3">
            {selectedMain.subObjects.map((sub) => {
              const status = statusForDomain(sub, domain);
              const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.draft;
              return (
                <NodeBox key={sub.id} active={selectedSub?.id === sub.id} onClick={() => openSub(sub)}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusClasses.dot}`} />
                    <div className="text-sm">{sub.name}</div>
                  </div>
                </NodeBox>
              );
            })}
          </div>
        </>
      )}

      <Modal open={modalOpen && !!selectedSub} onClose={() => setModalOpen(false)} title={selectedSub?.name || ''}>
        {selectedSub && (
          <div>
            <SwimLaneSample />
            <div className="text-xs mt-3 text-faint">
              Illustrative only — AI Chetak will generate the real swim lane once this document is accepted.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}