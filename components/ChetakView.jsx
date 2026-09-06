'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LevelSelector from '@/components/LevelSelector';
import ProcessTree from '@/components/ProcessTree';
import EmptyState from '@/components/EmptyState';
import GeneratedOutput from '@/components/GeneratedOutput';
import { useProcessSelection } from '@/lib/use-process-selection';
import { CONTENT_TYPES } from '@/lib/content-types';

export default function ChetakView({ tree }) {
  const router = useRouter();
  const { level, mainId, subId, domain, setLevel, setMain, setSub } = useProcessSelection();
  const [activeType, setActiveType] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [liveContent, setLiveContent] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;

  useEffect(() => {
    setActiveType(null);
    setLiveContent(null);
    setErrorMsg('');
  }, [selectedSub?.id, domain]);

  const existingAsset = selectedSub?.generatedAssets?.find((a) => a.type === activeType && a.domain === domain);
  const displayContent = liveContent ?? existingAsset?.content ?? null;

  async function generate(typeId) {
    setActiveType(typeId);
    setLiveContent(null);
    setErrorMsg('');

    const already = selectedSub?.generatedAssets?.find((a) => a.type === typeId && a.domain === domain);
    if (already) return; // already generated and persisted — just display it

    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subObjectId: selectedSub.id, subName: selectedSub.name, domain, type: typeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setLiveContent(data.asset.content);
      router.refresh(); // pulls the new row into the server-fetched tree for next time
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGenerating(false);
    }
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
          onSelectSub={setSub}
        />
      </div>

      <div className="flex-1" style={{ minWidth: 280 }}>
        {!selectedSub && <EmptyState text="Select a process to open the AI Chetak console." />}
        {selectedSub && (
          <div className="max-w-3xl animate-lia-fade">
            <div className="text-xs uppercase tracking-wider mb-2 text-faint">{selectedMain.name}</div>
            <h2 className="text-2xl font-semibold mb-1 font-display">{selectedSub.name}</h2>
            <div className="text-xs mb-6 text-faint">
              Model: pending client decision (Section 3.2) — /api/generate currently returns illustrative placeholders, real rows in generated_assets.
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {CONTENT_TYPES.map((ct) => {
                const active = activeType === ct.id;
                const done = selectedSub.generatedAssets?.some((a) => a.type === ct.id && a.domain === domain);
                return (
                  <button
                    key={ct.id}
                    onClick={() => generate(ct.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors border ${
                      active ? 'bg-accent/10 text-accent border-accent/40' : 'bg-surface text-muted border-border'
                    }`}
                  >
                    {ct.label}
                    {done && <span className="w-1.5 h-1.5 rounded-full bg-accepted" />}
                  </button>
                );
              })}
            </div>

            {activeType && (
              <div className="rounded-xl p-6 bg-surface border border-border">
                {generating ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="h-2.5 rounded bg-border-strong animate-lia-pulse" style={{ width: '70%' }} />
                    <div className="h-2.5 rounded bg-border-strong animate-lia-pulse" style={{ width: '90%', animationDelay: '.15s' }} />
                    <div className="h-2.5 rounded bg-border-strong animate-lia-pulse" style={{ width: '55%', animationDelay: '.3s' }} />
                  </div>
                ) : errorMsg ? (
                  <div className="text-xs text-review">{errorMsg}</div>
                ) : (
                  <GeneratedOutput type={activeType} content={displayContent} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
