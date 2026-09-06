'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import GeneratedOutput from '@/components/GeneratedOutput';
import { CONTENT_TYPES } from '@/lib/content-types';

// The popup's actual content: content-type picker, an editable prompt box
// pre-filled from a template, and a chat-style transcript. Each send calls
// /api/generate with the sub-object's id (so the document context is
// attached automatically server-side) plus whatever the user typed.
export default function ChetakChat({ sub, mainName, domain }) {
  const [activeType, setActiveType] = useState(CONTENT_TYPES[0].id);
  const [prompt, setPrompt] = useState(CONTENT_TYPES[0].promptTemplate(sub.name));
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const activeContentType = CONTENT_TYPES.find((c) => c.id === activeType);

  useEffect(() => {
    setPrompt(activeContentType ? activeContentType.promptTemplate(sub.name) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, sub.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function send() {
    const userPrompt = prompt.trim();
    if (!userPrompt || sending) return;

    setMessages((m) => [...m, { role: 'user', text: userPrompt }]);
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
          prompt: userPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setMessages((m) => [...m, { role: 'ai', output: data.asset.content, type: activeType, model: data.model }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'ai', error: err.message }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: '65vh' }}>
      <div className="text-xs text-faint mb-3">
        Context attached: <span className="text-ink font-medium">{mainName} → {sub.name}</span>
        <span className="mx-1.5">·</span>
        Model: <span className="text-accent">{activeContentType?.model}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-lg border border-border bg-base p-4 flex flex-col gap-4 mb-3">
        {messages.length === 0 && (
          <div className="text-sm text-faint m-auto text-center max-w-xs">
            Pick a content type, edit the pre-filled prompt below if you like, and send — the standardized document for this process is attached as context automatically.
          </div>
        )}

        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="self-end max-w-[85%] bg-accent text-white rounded-xl rounded-br-sm px-4 py-2.5 text-sm">
              {m.text}
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
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          className="flex-1 resize-none px-3 py-2 rounded-md text-sm bg-base border border-border text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Type your instruction, or edit the pre-filled prompt above…"
        />
        <button
          onClick={send}
          disabled={sending || !prompt.trim()}
          className="px-4 rounded-md bg-accent text-white flex items-center justify-center disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}