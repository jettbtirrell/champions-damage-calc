export default function DamageBar({ minDmg, maxDmg, defenderHp, noEffect, immune }) {
  if (immune) return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-2 bg-gray-700 rounded overflow-hidden" style={{ minWidth: 80 }} />
      <div className="shrink-0 text-right text-gray-500 italic" style={{ minWidth: '8rem', fontSize: 11 }}>Immune</div>
    </div>
  );
  if (noEffect) return <span className="text-gray-600 text-xs italic">—</span>;
  if (!defenderHp) return null;

  const minPct = (minDmg / defenderHp) * 100;
  const maxPct = (maxDmg / defenderHp) * 100;
  const [solidColor, fadeColor] =
    minDmg >= defenderHp ? ['#15803d', '#86efac'] // green: guaranteed OHKO
    : minPct > 50 ? ['#b45309', '#fcd34d'] // yellow: guaranteed >50%
    :               ['#b91c1c', '#fca5a5']; // red: not guaranteed >50%

  const solidWidth = Math.min(minPct, 100);
  const fadeLeft   = solidWidth;
  const fadeWidth  = Math.max(Math.min(maxPct, 100) - fadeLeft, solidWidth > 0 ? 0 : 0.8);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-2 bg-gray-700 rounded overflow-hidden" style={{ minWidth: 80 }}>
        {/* Solid: 0 → min% */}
        {solidWidth > 0 && (
          <div className="absolute top-0 left-0 h-full"
            style={{ width: `${solidWidth}%`, backgroundColor: solidColor }} />
        )}
        {/* Fade: min% → max% */}
        {(fadeWidth > 0 || solidWidth === 0) && (
          <div className="absolute top-0 h-full"
            style={{ left: `${fadeLeft}%`, width: `${Math.max(fadeWidth, 0.8)}%`, backgroundColor: fadeColor }} />
        )}
      </div>
      <div className="shrink-0 text-right" style={{ minWidth: '8rem', fontSize: 11 }}>
        <span className="text-gray-200">{minDmg}–{maxDmg}</span>
        <span className="text-gray-500 ml-1">
          ({Math.round(minPct)}–{Math.round(maxPct)}%)
        </span>
      </div>
    </div>
  );
}
