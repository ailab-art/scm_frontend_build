'use client';

import { useState } from 'react';
import { DOCUMENT_SECTIONS } from '@/lib/sections';

// Rendered inside a Modal, triggered by clicking Approve or Request Revision
// in the Review Queue. Approve just takes an optional general comment;
// Request Revision requires picking a section (S1-S6) and a comment/
// suggestion, since a revision needs to say what to fix and where.
export default function DecisionForm({ documentId, level, type, onDone, onCancel }) {
  const [section, setSection] = useState(DOCUMENT_SECTIONS[0]);
  const [kind, setKind] = useState('comment');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRevision = type === 'revision_requested';

  async function confirm() {
    if (isRevision && !body.trim()) {
      setError('Add a comment explaining what needs to change.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (body.trim()) {
        const commentRes = await fetch('/api/documents/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            level,
            section: isRevision ? section : 'General',
            kind: isRevision ? kind : 'comment',
            body: body.trim(),
          }),
        });
        const commentData = await commentRes.json();
        if (!commentRes.ok) throw new Error(commentData.error || 'Could not save comment');
      }

      const decideRes = await fetch('/api/documents/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, level, decision: type }),
      });
      const decideData = await decideRes.json();
      if (!decideRes.ok) throw new Error(decideData.error || 'Could not record decision');

      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="text-sm text-muted mb-4">
        {isRevision
          ? 'Explain what needs to change, tagged to the relevant section — this shows up against the document for whoever revises it.'
          : 'A comment is optional here — Approve just needs confirming.'}
      </div>

      {isRevision && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-md border border-border bg-surface text-ink"
          >
            {DOCUMENT_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setKind('comment')}
              className={`text-xs px-2.5 py-1.5 ${kind === 'comment' ? 'bg-accent/10 text-accent' : 'text-muted'}`}
            >
              Comment
            </button>
            <button
              onClick={() => setKind('suggestion')}
              className={`text-xs px-2.5 py-1.5 ${kind === 'suggestion' ? 'bg-accent/10 text-accent' : 'text-muted'}`}
            >
              Suggestion
            </button>
          </div>
        </div>
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={isRevision ? `What needs to change in ${section}?` : 'Optional comment…'}
        className="w-full text-sm px-3 py-2 rounded-md border border-border bg-base text-ink outline-none focus:border-accent mb-3"
      />

      {error && <div className="text-xs text-review mb-3">{error}</div>}

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-sm px-4 py-2 rounded-md border border-border text-muted">
          Cancel
        </button>
        <button
          onClick={confirm}
          disabled={submitting}
          className={`text-sm px-4 py-2 rounded-md font-medium text-white disabled:opacity-50 ${isRevision ? 'bg-review' : 'bg-accepted'}`}
        >
          {submitting ? 'Saving…' : isRevision ? 'Request revision' : 'Approve'}
        </button>
      </div>
    </div>
  );
}