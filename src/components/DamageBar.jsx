import { TIER_COLORS } from '../data/tierColors';

export default function DamageBar({ minDmg, maxDmg, defenderHp, noEffect, immune, lightBg = false }) {
  const trackColor = lightBg ? '#e5e7eb' : '#374151';
  const textColor  = lightBg ? '#111827' : '#e5e7eb';
  const pctColor   = lightBg ? '#6b7280' : '#6b7280';

  if (immune) return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-2 rounded overflow-hidden" style={{ minWidth: 80, backgroundColor: trackColor }} />
      <div className="shrink-0 text-right italic" style={{ minWidth: '8rem', fontSize: 11, color: pctColor }}>Immune</div>
    </div>
  );
  if (noEffect) return <span style={{ fontSize: 12, color: pctColor, fontStyle: 'italic' }}>—</span>;
  if (!defenderHp) return null;

  const minPct = (minDmg / defenderHp) * 100;
  const maxPct = (maxDmg / defenderHp) * 100;
  const tier = minDmg >= defenderHp ? 2 : minPct > 50 ? 1 : 0;
  const solidColor = TIER_COLORS[tier].border;
  // On light bg the card bg may match the pastel fade — use the border at 35% opacity instead
  const fadeColor  = lightBg ? TIER_COLORS[tier].border + '59' : TIER_COLORS[tier].bg;

  const solidWidth = Math.min(minPct, 100);
  const fadeLeft   = solidWidth;
  const fadeWidth  = Math.max(Math.min(maxPct, 100) - fadeLeft, solidWidth > 0 ? 0 : 0.8);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-2 rounded overflow-hidden" style={{ minWidth: 80, backgroundColor: trackColor }}>
        {solidWidth > 0 && (
          <div className="absolute top-0 left-0 h-full"
            style={{ width: `${solidWidth}%`, backgroundColor: solidColor }} />
        )}
        {(fadeWidth > 0 || solidWidth === 0) && (
          <div className="absolute top-0 h-full"
            style={{ left: `${fadeLeft}%`, width: `${Math.max(fadeWidth, 0.8)}%`, backgroundColor: fadeColor }} />
        )}
      </div>
      <div className="shrink-0 text-right" style={{ minWidth: '8rem', fontSize: 11 }}>
        <span style={{ color: textColor }}>{minDmg}–{maxDmg}</span>
        <span style={{ color: pctColor }} className="ml-1">
          ({Math.round(minPct)}–{Math.round(maxPct)}%)
        </span>
      </div>
    </div>
  );
}
