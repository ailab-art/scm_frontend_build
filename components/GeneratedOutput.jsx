import { Check, Image as ImageIcon } from 'lucide-react';
import SwimLaneSample from '@/components/SwimLaneSample';

export default function GeneratedOutput({ type, content }) {
  if (!content) return null;

  if (type === 'swim_lane') return <SwimLaneSample />;

  if (type === 'mcq') {
    return (
      <div>
        <div className="text-sm font-medium mb-3">{content.question}</div>
        <div className="flex flex-col gap-2">
          {content.options.map((opt, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs border ${
                i === content.correct ? 'bg-accepted/10 text-accepted border-accepted/40' : 'bg-base text-muted border-border'
              }`}
            >
              {i === content.correct && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              {opt}
            </div>
          ))}
        </div>
        {content.note && <div className="text-xs text-faint mt-3">{content.note}</div>}
      </div>
    );
  }

  if (type === 'image_prompt' || type === 'social_post') {
    return (
      <div>
        <div className="rounded-lg border border-dashed border-border-strong bg-base flex flex-col items-center justify-center py-8 px-4 mb-3">
          <ImageIcon className="w-7 h-7 text-faint mb-2" />
          <div className="text-xs text-faint text-center max-w-xs">{content.imageDescription}</div>
        </div>
        {content.caption && <div className="text-sm whitespace-pre-line leading-7 mb-2">{content.caption}</div>}
        <div className="text-xs text-review">
          Image placeholder — real generation needs an image model connected (not yet decided/wired up).
        </div>
        {content.note && <div className="text-xs text-faint mt-1">{content.note}</div>}
      </div>
    );
  }

  return <div className="text-sm whitespace-pre-line leading-7">{content}</div>;
}