'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, Circle, ArrowUpRight, Layers, Send } from 'lucide-react';
import MainObjectGrid from '@/components/MainObjectGrid';
import ProcessChips from '@/components/ProcessChips';
import Modal from '@/components/Modal';
import { useProcessSelection } from '@/lib/use-process-selection';
import { docForDomain, statusForDomain, STATUS_LABEL, STATUS_CLASSES } from '@/lib/status';
import { daysRemaining } from '@/lib/review';

const STATUS_ICON = { accepted: Check, level1_review: Clock, level2_review: Clock, draft: Circle };

function defaultDomainFor(sub) {
  const domains = [...new Set((sub.documents || []).map((d) => d.domain))];
  return domains.includes('Manufacturing') ? 'Manufacturing' : domains[0] || 'Standard';
}

export default function DukanView({ tree }) {
  const router = useRouter();
  const { level, mainId, subId, domain, setLevel, setMain, setSub, setDomain } = useProcessSelection();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const mainObjectsForLevel = tree.filter((mo) => mo.level === level);
  const selectedMain = tree.find((mo) => mo.id === mainId) || null;
  const selectedSub = selectedMain?.subObjects.find((s) => s.id === subId) || null;
  const doc = selectedSub ? docForDomain(selectedSub, domain) : null;
  const status = selectedSub ? statusForDomain(selectedSub, domain) : 'draft';
  const StatusIcon = STATUS_ICON[status] || Circle;
  const statusClasses = STATUS_CLASSES[status] || STATUS_CLASSES.draft;
  const availableDomains = selectedSub ? [...new Set(selectedSub.documents.map((d) => d.domain))] : [];

  function openTile(mo) {
    setModalOpen(true);
    if (mo.subObjects.length === 0) {
      setMain(mo.id);
      return;
    }
    const first = mo.subObjects[0];
    setSub(mo.id, first.id, defaultDomainFor(first));
  }

  async function submitForReview() {
    if (!doc) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/documents/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit for review');
      router.refresh();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <MainObjectGrid
        level={level}
        onSelectLevel={setLevel}
        mainObjectsForLevel={mainObjectsForLevel}
        onOpenMain={openTile}
        icon={Layers}
        itemLabel="documents"
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
                <div className="text-base font-medium mb-4 text-ink">{selectedSub.name}</div>

                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono text-muted border border-border">
                    {selectedSub.id}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusClasses.badge}`}>
                    <StatusIcon className="w-3 h-3" /> {STATUS_LABEL[status]}
                  </span>
                  {availableDomains.length > 1 ? (
                    <div className="inline-flex rounded-full p-0.5 bg-base border border-border">
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
                  className="rounded-xl p-8 relative overflow-hidden bg-base border border-border"
                  style={{
                    backgroundImage: 'linear-gradient(#DCE3ED 1px, transparent 1px), linear-gradient(90deg, #DCE3ED 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                  }}
                >
                  {doc?.signed_url ? (
                    <div>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="text-sm font-medium">{domain} E2E document</div>
                        <a
                          href={doc.signed_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-faint hover:text-ink flex-shrink-0"
                        >
                          Open in new tab <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                      <iframe
                        src={doc.signed_url}
                        title={selectedSub.name}
                        className="w-full rounded-lg border border-border"
                        style={{ height: '55vh' }}
                      />
                      <div className="text-xs mt-2 text-faint">
                        This link expires after an hour — it's regenerated automatically the next time this page loads.
                        {status !== 'accepted' && ' Viewable pre-approval so reviewers can actually read it.'}
                      </div>
                    </div>
                  ) : status === 'accepted' ? (
                    <div className="text-xs text-review">
                      Marked accepted, but no file is attached yet — set <code className="font-mono">storage_path</code> on this document row in Supabase.
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

                {status === 'draft' && doc?.signed_url && (
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={submitForReview}
                      disabled={submitting}
                      className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-accent text-white disabled:opacity-60"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submitting ? 'Submitting…' : 'Submit for review'}
                    </button>
                    <span className="text-xs text-faint">Starts the 20-day Level 1 + Level 2 review clock.</span>
                  </div>
                )}
                {submitError && <div className="text-xs text-review mt-2">{submitError}</div>}

                {(status === 'level1_review' || status === 'accepted') && doc?.level1_submitted_at && (
                  <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-faint">
                        Level 1 — <span className="text-ink font-medium">{doc.level1_reviewer}</span>
                      </span>
                      <span className={doc.level1_status === 'approved' || doc.level1_status === 'auto_accepted' ? 'text-accepted' : 'text-review'}>
                        {doc.level1_status === 'approved' && 'Approved'}
                        {doc.level1_status === 'auto_accepted' && 'Auto-accepted (no feedback within 20 days)'}
                        {doc.level1_status === 'revision_requested' && 'Revision requested'}
                        {!doc.level1_status && daysRemaining(doc.level1_deadline) >= 0 && `${daysRemaining(doc.level1_deadline)} days until auto-accept`}
                        {!doc.level1_status && daysRemaining(doc.level1_deadline) < 0 && 'Overdue — will auto-accept on next load'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className="text-faint">
                        Level 2 — <span className="text-ink font-medium">{doc.level2_reviewer}</span>
                      </span>
                      <span className={doc.level2_status === 'approved' ? 'text-accepted' : 'text-review'}>
                        {doc.level2_status === 'approved' && 'Approved'}
                        {doc.level2_status === 'revision_requested' && 'Revision requested'}
                        {!doc.level2_status && 'Runs concurrently with Level 1 — no billing impact either way (Section 5.5)'}
                      </span>
                    </div>
                    {doc.revision_count > 0 && (
                      <div className="text-faint">Revision rounds so far: {doc.revision_count}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-faint">Pick a process above to preview its document.</div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}