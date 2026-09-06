'use client';

import { useState } from 'react';
import LevelSelector from '@/components/LevelSelector';
import ProcessTree from '@/components/ProcessTree';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ChetakChat from '@/components/ChetakChat';
import { useProcessSelection } from '@/lib/use-process-selection';

export default function ChetakView({ tree }) {
  const { level, mainId, subId, domain, setLevel, setMain, setSub } = useProcessSelection();
  const [modalOpen, setModalOpen] = useState(false);

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;

  function handleSelectSub(mId, sId) {
    setSub(mId, sId, domain);
    setModalOpen(true);
  }

  return (
    <div className="flex gap-6 flex-wrap">
      <div className="w-80 flex-shrink-0 rounded-xl overflow-hidden border border-border">
        <div className="p-3">
          <LevelSelector level={level} onSelect={setLevel} />
        </div>
        <ProcessTree
          mainObjectsForLevel={mainObjectsForLevel}
          selectedMainId={mainId}
          selectedSubId={subId}
          domain={domain}
          onSelectMain={setMain}
          onSelectSub={handleSelectSub}
        />
      </div>

      <div className="flex-1" style={{ minWidth: 280 }}>
        {!selectedSub && <EmptyState text="Select a process to open the AI Chetak assistant." />}
        {selectedSub && !modalOpen && (
          <button onClick={() => setModalOpen(true)} className="text-sm px-4 py-2 rounded-md bg-accent text-white">
            Reopen AI Chetak — {selectedSub.name}
          </button>
        )}
      </div>

      <Modal open={modalOpen && !!selectedSub} onClose={() => setModalOpen(false)} title={selectedSub?.name || 'AI Chetak'}>
        {selectedSub && <ChetakChat sub={selectedSub} mainName={selectedMain.name} domain={domain} />}
      </Modal>
    </div>
  );
}