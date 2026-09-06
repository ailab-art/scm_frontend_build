'use client';

import { FileText, Check, Clock, Circle, ArrowUpRight } from 'lucide-react';
import LevelSelector from '@/components/LevelSelector';
import ProcessTree from '@/components/ProcessTree';
import EmptyState from '@/components/EmptyState';
import { useProcessSelection } from '@/lib/use-process-selection';
import { docForDomain, statusForDomain, STATUS_LABEL, STATUS_CLASSES } from '@/lib/status';

const STATUS_ICON = { accepted: Check, level1_review: Clock, level2_review: Clock, draft: Circle };

export default function DukanView({ tree }) {
  const { level, mainId, subId, domain, setLevel, setMain, setSub, setDomain } = useProcessSelection();

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;
  const doc = selectedSub ? docForDomain(selectedSub, domain) : null;
  const status = selectedSub ? statusForDomain(selectedSub, domain) : 'draft';
  const StatusIcon = STATUS_ICON[status] || Circle;
  const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.draft;
  const availableDomains = selectedSub ? [...new Set(selectedSub.documents.map((d) => d.domain))] : [];

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
        {!selectedSub && <EmptyState text="Select a process to preview its standardized E2E document." />}
        {selectedSub && (
          <div className="max-w-3xl animate-lia-fade">
            <div className="text-xs uppercase tracking-wider mb-2 text-faint">{level} · {selectedMain.name}</div>
            <h1 className="text-2xl font-semibold mb-5 font-display">{selectedSub.name}</h1>

            <div className="flex items-center gap-2 mb-8 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-muted border border-border">
                {selectedSub.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusClasses.badge}`}>
                <StatusIcon className="w-3 h-3" /> {STATUS_LABEL[status]}
              </span>
              {availableDomains.length > 1 ? (
                <div className="inline-flex rounded-full p-0.5 bg-surface border border-border">
                  {availableDomains.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDomain(d)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${domain === d ? 'bg-accent/10 text-accent' : 'text-muted'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="px-3 py-1 text-xs rounded-full border border-border text-faint">Single-domain process</span>
              )}
            </div>

            <div
              className="rounded-xl p-8 relative overflow-hidden bg-surface border border-border"
              style={{
                backgroundImage: 'linear-gradient(#DCE3ED 1px, transparent 1px), linear-gradient(90deg, #DCE3ED 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            >
              {status === 'accepted' ? (
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-12 h-14 rounded flex items-center justify-center flex-shrink-0 bg-accepted/10 border border-accepted/40">
                    <FileText className="w-5 h-5 text-accepted" />
                  </div>
                  <div className="flex-1" style={{ minWidth: 160 }}>
                    <div className="text-sm font-medium">{domain} E2E document</div>
                    <div className="text-xs mt-0.5 text-faint">
                      {doc?.file_url ? doc.file_url : 'No file_url set yet — upload the accepted PDF and update this row'}
                    </div>
                  </div>
                  <a
                    href={doc?.file_url || '#'}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md flex-shrink-0 border border-border text-faint hover:text-ink"
                  >
                    Open <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div>
                  <div className="text-xs mb-4 text-faint">
                    {status === 'draft' ? 'Not yet submitted for review' : 'Awaiting reviewer feedback'}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="h-2.5 rounded bg-border-strong animate-lia-pulse" style={{ width: '85%' }} />
                    <div className="h-2.5 rounded bg-border-strong animate-lia-pulse" style={{ width: '95%', animationDelay: '.2s' }} />
                    <div className="h-2.5 rounded bg-border-strong animate-lia-pulse" style={{ width: '60%', animationDelay: '.4s' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
