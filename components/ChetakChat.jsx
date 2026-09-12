'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import GeneratedOutput from '@/components/GeneratedOutput';
import { CONTENT_TYPES } from '@/lib/content-types';

// The base prompt (expert persona + task) is fixed per content type and
// shown read-only — the user adds optional extra instructions in a separate
// box rather than editing the base directly, so the persona framing can't
// get accidentally overwritten. The two get joined into one string only at
// send time.
export default function ChetakChat({ sub, mainName, domain }) {
  const [activeType, setActiveType] = useState(CONTENT_TYPES[0].id);
  const [extra, setExtra] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const activeContentType = CONTENT_TYPES.find((c) => c.id === activeType);
  const basePrompt = activeContentType ? activeContentType.basePrompt(sub.name) : '';

  useEffect(() => {
    setExtra('');
  }, [activeType, sub.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function send() {
    if (sending) return;
    const trimmedExtra = extra.trim();
    const combinedPrompt = trimmedExtra ? `${basePrompt}\n\nAdditional instructions from user: ${trimmedExtra}` : basePrompt;

    setMessages((m) => [...m, { role: 'user', text: trimmedExtra }]);
    setSending(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subObjectId: sub.id,
          subName: sub.name,
          domain,
          type: activeType,
          prompt: combinedPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setMessages((m) => [...m, { role: 'ai', output: data.asset.content, type: activeType, model: data.model }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', error: err.message }]);
    } finally {
      setSending(false);
      setExtra('');
    }
  }

  return (
    <div className="flex flex-col" style={{ height: '60vh' }}>
      <div className="text-xs text-faint mb-3">
        Context attached: <span className="text-ink font-medium">{mainName} → {sub.name}</span>
        <span className="mx-1.5">·</span>
        Model: <span className="text-accent">{activeContentType?.model}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.id}
            onClick={() => setActiveType(ct.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeType === ct.id ? 'bg-accent/10 text-accent border-accent/40' : 'bg-base text-muted border-border'
            }`}
          >
            {ct.label}
          </button>
        ))}
      </div>

      <div className="text-xs px-3 py-2 rounded-md bg-base border border-border text-muted mb-3">
        <span className="font-medium text-faint">Base instruction (fixed): </span>
        {basePrompt}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-lg border border-border bg-base p-4 flex flex-col gap-4 mb-3">
        {messages.length === 0 && (
          <div className="text-sm text-faint m-auto text-center max-w-xs">
            The base instruction above is always sent. Add anything extra below if you want to steer tone, length, or focus — or just send as-is.
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="self-end max-w-[85%] bg-accent text-white rounded-xl rounded-br-sm px-4 py-2.5 text-sm">
              {m.text || <span className="italic opacity-80">(sent with base prompt only)</span>}
            </div>
          ) : (
            <div key={i} className="self-start max-w-[90%] bg-surface border border-border rounded-xl rounded-bl-sm px-4 py-3">
              {m.error ? (
                <div className="text-xs text-review">{m.error}</div>
              ) : (
                <>
                  <GeneratedOutput type={m.type} content={m.output} />
                  <div className="text-xs text-faint mt-2 pt-2 border-t border-border">
                    Generated with {m.model} — placeholder output, real model call pending Section 3.2 decision
                  </div>
                </>
              )}
            </div>
          )
        )}

        {sending && (
          <div className="self-start max-w-[60%] bg-surface border border-border rounded-xl rounded-bl-sm px-4 py-3 flex flex-col gap-2">
            <div className="h-2 rounded bg-border-strong animate-lia-pulse" style={{ width: '70%' }} />
            <div className="h-2 rounded bg-border-strong animate-lia-pulse" style={{ width: '50%', animationDelay: '.15s' }} />
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <textarea
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          className="flex-1 resize-none px-3 py-2 rounded-md text-sm bg-base border border-border text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Optional: add extra instructions (tone, length, specific focus)…"
        />
        <button
          onClick={send}
          disabled={sending}
          className="px-4 rounded-md bg-accent text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}