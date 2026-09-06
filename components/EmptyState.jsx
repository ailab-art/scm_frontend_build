import { FileText } from 'lucide-react';

export default function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 max-w-md mx-auto">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-surface border border-border">
        <FileText className="w-6 h-6 text-faint" />
      </div>
      <div className="text-sm text-muted">{text}</div>
    </div>
  );
}
