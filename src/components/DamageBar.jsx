import { TIER_COLORS } from '../data/tierColors';

const VARIANTS = {
  // rows on white card section (regular damage tab)
  white: {
    track: '#1f2937',
    text:  '#111827',
    pct:   '#6b7280',
    fade:  tier => TIER_COLORS[tier].bg,
  },
  // rows on pastel card (test cases tab)
  pastel: {
    track: '#e5e7eb',
    text:  '#111827',
    pct:   '#6b7280',
    // border color at ~35% opacity avoids blending into matching-tier card bg
    fade:  tier => TIER_COLORS[tier].border + '59',
  },
  // rows on dark bg (unused now, kept for safety)
  dark: {
    track: '#374151',
    text:  '#e5e7eb',
    pct:   '#6b7280',
    fade:  tier => TIER_COLORS[tier].bg,
  },
};

export default function DamageBar({ minDmg, maxDmg, defenderHp, noEffect, immune, variant = 'white' }) {
  const v = VARIANTS[variant] ?? VARIANTS.white;

  if (immune) return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-2 rounded overflow-hidden" style={{ minWidth: 80, backgroundColor: v.track }} />
      <div className="shrink-0 text-right italic" style={{ minWidth: '8rem', fontSize: 11, color: v.pct }}>Immune</div>
    </div>
  );
  if (noEffect) return <span style={{ fontSize: 12, color: v.pct, fontStyle: 'italic' }}>—</span>;
  if (!defenderHp) return null;

  const minPct = (minDmg / defenderHp) * 100;
  const maxPct = (maxDmg / defenderHp) * 100;
  const tier = minDmg >= defenderHp ? 2 : minPct > 50 ? 1 : 0;
  const solidColor = TIER_COLORS[tier].border;
  const fadeColor  = v.fade(tier);

  const solidWidth = Math.min(minPct, 100);
  const fadeLeft   = solidWidth;
  const fadeWidth  = Math.max(Math.min(maxPct, 100) - fadeLeft, solidWidth > 0 ? 0 : 0.8);

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative flex-1 h-2 rounded overflow-hidden" style={{ minWidth: 80, backgroundColor: v.track }}>
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
        <span style={{ color: v.text }}>{minDmg}–{maxDmg}</span>
        <span style={{ color: v.pct }} className="ml-1">
          ({Math.round(minPct)}–{Math.round(maxPct)}%)
        </span>
      </div>
    </div>
  );
}
