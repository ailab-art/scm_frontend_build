'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Lightbulb } from 'lucide-react';
import { DOCUMENT_SECTIONS } from '@/lib/sections';

// Shared comment/suggestion thread for a document, tagged by section (S1-S6)
// and review level. Used read-only in Knowledge Granths (canAdd=false) so
// the content team can see exactly what needs fixing and where, and with
// adding enabled in the Review Queue.
export default function CommentThread({ documentId, canAdd = false }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [section, setSection] = useState(DOCUMENT_SECTIONS[0]);
  const [kind, setKind] = useState('comment');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/comments?documentId=${documentId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    if (!body.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/documents/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, level, section, kind, body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not add comment');
      setBody('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="text-xs text-faint">Loading comments…</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-faint">No comments yet.</div>
      ) : (
        <div className="flex flex-col gap-2 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="text-xs rounded-md border border-border bg-base p-2.5">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono" style={{ fontSize: '10px' }}>
                  {c.section}
                </span>
                <span className={`flex items-center gap-1 ${c.kind === 'suggestion' ? 'text-accepted' : 'text-muted'}`}>
                  {c.kind === 'suggestion' ? <Lightbulb className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                  {c.kind === 'suggestion' ? 'Suggestion' : 'Comment'}
                </span>
                <span className="text-faint ml-auto">
                  {c.level ? `L${c.level}` : 'Revision note'} · {c.reviewer || 'Uploader'} · {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="text-ink">{c.body}</div>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="text-xs px-2 py-1.5 rounded-md border border-border bg-surface text-ink"
            >
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
            </select>
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
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder={`Add a ${kind} on ${section}…`}
            className="text-xs px-2.5 py-2 rounded-md border border-border bg-surface text-ink outline-none focus:border-accent"
          />
          {error && <div className="text-xs text-review">{error}</div>}
          <button
            onClick={submit}
            disabled={submitting || !body.trim()}
            className="self-start text-xs px-3 py-1.5 rounded-md bg-accent text-white disabled:opacity-50"
          >
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </div>
      )}
    </div>
  );
}