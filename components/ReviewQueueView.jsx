'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, ArrowUpRight, Clock } from 'lucide-react';
import { daysRemaining } from '@/lib/review';

function flattenPending(tree) {
  const rows = [];
  tree.forEach((mo) => {
    mo.subObjects.forEach((sub) => {
      (sub.documents || []).forEach((doc) => {
        if (doc.status === 'level1_review') {
          rows.push({ mainName: mo.name, subName: sub.name, level: mo.level, ...doc });
        }
      });
    });
  });
  return rows.sort((a, b) => new Date(a.level1_deadline) - new Date(b.level1_deadline));
}

export default function ReviewQueueView({ tree }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState('');
  const rows = flattenPending(tree);

  async function decide(documentId, level, decision) {
    setError('');
    setBusyKey(`${documentId}-${level}`);
    try {
      const res = await fetch('/api/documents/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, level, decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not record decision');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyKey(null);
    }
  }

  if (rows.length === 0) {
    return (
      <div className="text-sm text-faint py-16 text-center max-w-sm mx-auto">
        Nothing awaiting review right now — submit a document from Knowledge Granths and it'll show up here.
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-faint mb-4">
        {rows.length} document{rows.length !== 1 ? 's' : ''} awaiting review
      </div>
      {error && <div className="text-xs text-review mb-3">{error}</div>}

      <div className="flex flex-col gap-3">
        {rows.map((doc) => {
          const days = daysRemaining(doc.level1_deadline);
          const urgent = days !== null && days <= 5;
          return (
            <div key={doc.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs text-faint">{doc.level} · {doc.mainName}</div>
                  <div className="text-sm font-medium text-ink">{doc.subName}</div>
                  <div className="text-xs text-faint mt-0.5">
                    {doc.domain} · submitted {doc.level1_submitted_at ? new Date(doc.level1_submitted_at).toLocaleDateString() : '—'}
                  </div>
                </div>
                <div
                  className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 flex-shrink-0 ${
                    urgent ? 'bg-review/10 text-review' : 'bg-base border border-border text-muted'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  {days !== null && days >= 0 ? `${days}d left` : 'overdue'}
                </div>
              </div>

              {doc.signed_url && (
                <a
                  href={doc.signed_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-faint hover:text-ink mt-3"
                >
                  Open document <ArrowUpRight className="w-3 h-3" />
                </a>
              )}

              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div className="rounded-md bg-base border border-border p-3">
                  <div className="text-xs text-faint mb-2">Level 1 — {doc.level1_reviewer}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(doc.id, 1, 'approved')}
                      disabled={busyKey === `${doc.id}-1`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-accepted/10 text-accepted disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => decide(doc.id, 1, 'revision_requested')}
                      disabled={busyKey === `${doc.id}-1`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-review/10 text-review disabled:opacity-50"
                    >
                      <X className="w-3 h-3" /> Request revision
                    </button>
                  </div>
                </div>
                <div className="rounded-md bg-base border border-border p-3">
                  <div className="text-xs text-faint mb-2">Level 2 — {doc.level2_reviewer}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(doc.id, 2, 'approved')}
                      disabled={busyKey === `${doc.id}-2`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-accepted/10 text-accepted disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => decide(doc.id, 2, 'revision_requested')}
                      disabled={busyKey === `${doc.id}-2`}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-review/10 text-review disabled:opacity-50"
                    >
                      <X className="w-3 h-3" /> Request revision
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}