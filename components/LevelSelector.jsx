'use client';

const LEVELS = ['Basic', 'Advance', 'Super Advance'];

export default function LevelSelector({ level, onSelect }) {
  const idx = LEVELS.indexOf(level);
  return (
    <div className="relative grid grid-cols-3 rounded-lg p-1 bg-base border border-border">
      <div
        className="absolute top-1 bottom-1 rounded-md bg-accent/10 border border-accent/40 transition-transform duration-300 ease-out"
        style={{ width: 'calc(33.333% - 4px)', left: '2px', transform: `translateX(${idx * 100}%)` }}
      />
      {LEVELS.map((lvl) => (
        <button
          key={lvl}
          onClick={() => onSelect(lvl)}
          className={`relative z-10 text-xs font-medium py-2 rounded-md ${level === lvl ? 'text-accent' : 'text-muted'}`}
        >
          {lvl}
        </button>
      ))}
    </div>
  );
}
