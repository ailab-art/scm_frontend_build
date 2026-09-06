import { Check } from 'lucide-react';
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
      </div>
    );
  }

  return <div className="text-sm whitespace-pre-line leading-7">{content}</div>;
}
