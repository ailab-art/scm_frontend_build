'use client';

import { useState } from 'react';
import { GitBranch } from 'lucide-react';
import MainObjectGrid from '@/components/MainObjectGrid';
import ProcessChips from '@/components/ProcessChips';
import SwimLaneSample from '@/components/SwimLaneSample';
import Modal from '@/components/Modal';
import { useProcessSelection } from '@/lib/use-process-selection';

function defaultDomainFor(sub) {
  const domains = [...new Set((sub.documents || []).map((d) => d.domain))];
  return domains.includes('Manufacturing') ? 'Manufacturing' : domains[0] || 'Standard';
}

export default function MelaView({ tree }) {
  const { level, mainId, subId, domain, setLevel, setMain, setSub } = useProcessSelection();
  const [modalOpen, setModalOpen] = useState(false);

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;

  function openTile(mo) {
    setModalOpen(true);
    if (mo.subObjects.length === 0) {
      setMain(mo.id);
      return;
    }
    const first = mo.subObjects[0];
    setSub(mo.id, first.id, defaultDomainFor(first));
  }

  return (
    <div>
      <MainObjectGrid
        level={level}
        onSelectLevel={setLevel}
        mainObjectsForLevel={mainObjectsForLevel}
        onOpenMain={openTile}
        icon={GitBranch}
        itemLabel="process flows"
      />

      <Modal open={modalOpen && !!selectedMain} onClose={() => setModalOpen(false)} title={selectedMain?.name || ''}>
        {selectedMain && (
          <>
            <ProcessChips
              subObjects={selectedMain.subObjects}
              selectedSubId={selectedSub?.id}
              domain={domain}
              onSelectSub={(sub) => setSub(selectedMain.id, sub.id, defaultDomainFor(sub))}
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