import { NATURES } from '../utils/natures';
import { calcAllStats, STAT_KEYS, STAT_LABELS, TOTAL_STAT_POINTS, MAX_PER_STAT, totalPoints, applyBoost } from '../utils/statCalc';

export default function StatEditor({ pokemon, statPoints, nature, onChange, boosts = {} }) {
  const natureDef = NATURES[nature] || NATURES.hardy;
  const used = totalPoints(statPoints);
  const computed = calcAllStats(pokemon, statPoints, nature);
  const anyBoosted = STAT_KEYS.some(s => (boosts[s] || 0) > 0);
  const valWidth = anyBoosted ? '5.5rem' : '2.25rem';
  const plusStyle  = { color: 'var(--stat-plus)'  };
  const minusStyle = { color: 'var(--stat-minus)' };

  function set(stat, rawVal) {
    const val = Math.min(MAX_PER_STAT, Math.max(0, parseInt(rawVal, 10) || 0));
    const remaining = TOTAL_STAT_POINTS - used + (statPoints[stat] || 0);
    const clamped = Math.min(val, remaining);
    onChange({ ...statPoints, [stat]: clamped });
  }

  return (
    <div className="space-y-1">
      {STAT_KEYS.map(stat => {
        const isPlus = natureDef.plus === stat;
        const isMinus = natureDef.minus === stat;
        const natStyle = isPlus ? plusStyle : isMinus ? minusStyle : {};
        const boost = boosts[stat] || 0;
        const boostedVal = boost > 0 ? applyBoost(computed[stat], boost) : null;

        return (
          <div key={stat} className="flex items-center gap-1.5">
            <span className="text-xs font-medium w-8 shrink-0 text-gray-400" style={natStyle}>
              {STAT_LABELS[stat]}
              {isPlus && <span className="ml-0.5">+</span>}
              {isMinus && <span className="ml-0.5">–</span>}
            </span>
            <input
              type="range"
              min={0}
              max={MAX_PER_STAT}
              value={statPoints[stat] || 0}
              onChange={e => set(stat, e.target.value)}
              className="flex-1 h-1"
            />
            <input
              type="number"
              min={0}
              max={MAX_PER_STAT}
              value={statPoints[stat] || 0}
              onChange={e => set(stat, e.target.value)}
              className="w-10 bg-gray-700 border border-gray-600 rounded text-center text-xs text-gray-100 py-0.5 focus:outline-none focus:border-blue-500"
            />
            <span className="text-xs shrink-0 font-mono text-right text-gray-300"
              style={{ minWidth: valWidth, ...(isPlus ? plusStyle : isMinus ? minusStyle : {}) }}>
              {computed[stat]}
              {boostedVal && (
                <span className="ml-1" style={{ color: 'var(--stat-boost)' }}>({boostedVal})</span>
              )}
            </span>
          </div>
        );
      })}
      <div className="text-xs text-right text-gray-500"
        style={used > TOTAL_STAT_POINTS ? { color: 'var(--stat-minus)' } : undefined}>
        {used} / {TOTAL_STAT_POINTS} pts
      </div>
    </div>
  );
}
