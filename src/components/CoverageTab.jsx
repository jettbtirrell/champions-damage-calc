import { useState, useMemo } from 'react';
import { getTypeEffectiveness, TYPE_COLORS } from '../data/typeChart';
import { getEffectiveMove } from '../data/abilities';
import { toDisplayName } from '../utils/importExport';

const ALL_TYPES = [
  'normal','fire','water','grass','electric','ice',
  'fighting','poison','ground','flying','psychic','bug',
  'rock','ghost','dragon','dark','steel','fairy',
];

const EFF_GROUPS = [
  { key: 4,    label: '4×',           bg: '#450a0a', text: '#fca5a5', defaultOpen: true  },
  { key: 2,    label: '2×',           bg: '#7c2d12', text: '#fdba74', defaultOpen: true  },
  { key: 1,    label: 'Neutral (1×)', bg: '#1f2937', text: '#9ca3af', defaultOpen: false },
  { key: 0.5,  label: '½×',           bg: '#1e3a8a', text: '#bfdbfe', defaultOpen: false },
  { key: 0.25, label: '¼×',           bg: '#172554', text: '#93c5fd', defaultOpen: false },
  { key: 0,    label: 'Immune (0×)',   bg: '#111827', text: '#4b5563', defaultOpen: false },
];

const GOALS = [
  {
    key: 'super-effective',
    label: 'Most 2x+ coverage',
    description: 'Maximize Pokémon hit for 2x or better — 4x counts as strictly better',
    sort: (a, b) => b.gained2xPlus - a.gained2xPlus || b.gained4x - a.gained4x,
    primary: r => `+${r.gained2xPlus} newly at 2x+`,
    secondary: r => r.gained4x > 0 ? `(+${r.gained4x} at 4x)` : null,
  },
  {
    key: 'quad',
    label: 'Most 4x hits',
    description: 'Maximize Pokémon you can hit for 4x — raw OHKO potential',
    sort: (a, b) => b.total4x - a.total4x || b.total2xPlus - a.total2xPlus,
    primary: r => `${r.total4x} total at 4x`,
    secondary: r => `${r.total2xPlus} total at 2x+`,
  },
  {
    key: 'minimize-walls',
    label: 'Minimize ≤½x',
    description: 'Minimize Pokémon still at ½x or below after adding this type',
    sort: (a, b) => a.wallsAfter - b.wallsAfter || b.gained2xPlus - a.gained2xPlus,
    primary: r => `${r.wallsAfter} still walled`,
    secondary: r => `+${r.gained2xPlus} at 2x+`,
  },
  {
    key: 'plug-immune',
    label: 'Plug immunities',
    description: 'Maximize Pokémon currently immune to all your moves that this type can reach',
    sort: (a, b) => b.pluggedImmune - a.pluggedImmune || b.gained2xPlus - a.gained2xPlus,
    primary: r => `+${r.pluggedImmune} immunities hit`,
    secondary: r => r.gained2xPlus > 0 ? `+${r.gained2xPlus} at 2x+` : null,
  },
];

export default function CoverageTab({ attackers, pokemonData }) {
  const eligible = attackers.filter(a => a.pokemon);
  const [selectedIds, setSelectedIds] = useState(() => new Set(eligible.map(a => a.id)));
  const [openGroups, setOpenGroups] = useState(
    () => new Set(EFF_GROUPS.filter(g => g.defaultOpen).map(g => g.key))
  );
  const [goal, setGoal] = useState('super-effective');
  const [showAllRecs, setShowAllRecs] = useState(false);

  function toggleAttacker(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleGroup(key) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const { groups, moveTypes, recommendations } = useMemo(() => {
    const selected = eligible.filter(a => selectedIds.has(a.id));

    const types = new Set();
    for (const a of selected) {
      for (const move of a.moves) {
        if (move.power > 0 && (move.category === 'physical' || move.category === 'special')) {
          const { type } = getEffectiveMove(move, a.ability);
          types.add(type);
        }
      }
    }

    if (types.size === 0) return { groups: null, moveTypes: types, recommendations: null };

    // Compute per-Pokemon current best effectiveness
    const pokemonBests = pokemonData.map(p => {
      let best = 0;
      for (const t of types) {
        const e = getTypeEffectiveness(t, p.types);
        if (e > best) best = e;
      }
      return { pokemon: p, best };
    });

    // Group by current best
    const g = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] };
    for (const { pokemon, best } of pokemonBests) {
      const bucket = g[best];
      if (bucket) bucket.push(pokemon);
      else g[1].push(pokemon);
    }

    // Compute recommendation scores for all 18 types
    const recs = ALL_TYPES.map(type => {
      let gained2xPlus = 0;
      let total2xPlus = 0;
      let gained4x = 0;
      let total4x = 0;
      let pluggedImmune = 0;
      let wallsAfter = 0;

      for (const { pokemon, best: currentBest } of pokemonBests) {
        const typeEff = getTypeEffectiveness(type, pokemon.types);
        const newBest = Math.max(currentBest, typeEff);

        if (newBest >= 2) total2xPlus++;
        if (newBest >= 4) total4x++;
        if (currentBest < 2 && newBest >= 2) gained2xPlus++;
        if (currentBest < 4 && newBest >= 4) gained4x++;
        if (currentBest === 0 && typeEff > 0) pluggedImmune++;
        if (newBest <= 0.5) wallsAfter++;
      }

      return {
        type,
        gained2xPlus, total2xPlus,
        gained4x, total4x,
        pluggedImmune,
        wallsAfter,
        alreadyHave: types.has(type),
      };
    });

    return { groups: g, moveTypes: types, recommendations: recs };
  }, [selectedIds, attackers, pokemonData]);

  const hasImmunities = groups ? (groups[0]?.length ?? 0) > 0 : false;
  const activeGoalKey = (!hasImmunities && goal === 'plug-immune') ? 'super-effective' : goal;
  const visibleGoals = GOALS.filter(g => g.key !== 'plug-immune' || hasImmunities);
  const currentGoal = GOALS.find(g => g.key === activeGoalKey);
  const sortedRecs = recommendations
    ? [...recommendations].sort(currentGoal.sort)
    : null;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Attacker selector */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Attackers to include:</div>
        {eligible.length === 0 ? (
          <p className="text-gray-600 text-sm italic">No attackers with a Pokémon set.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {eligible.map(a => {
              const on = selectedIds.has(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAttacker(a.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-colors ${
                    on
                      ? 'bg-blue-700 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {(a.pokemon.artwork || a.pokemon.sprite) && (
                    <img
                      src={a.pokemon.artwork || a.pokemon.sprite}
                      onError={e => { if (a.pokemon.sprite) e.target.src = a.pokemon.sprite; }}
                      alt="" className="w-6 h-6 object-contain"
                    />
                  )}
                  {toDisplayName(a.pokemon.name)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active coverage types */}
      {moveTypes && moveTypes.size > 0 && (
        <div className="flex flex-wrap items-center gap-1 mb-4">
          <span className="text-xs text-gray-500 mr-1">Coverage types:</span>
          {[...moveTypes].sort().map(t => (
            <span key={t} className="rounded text-white px-1.5 py-0.5 font-medium"
              style={{ backgroundColor: TYPE_COLORS[t] || '#888', fontSize: 10 }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {selectedIds.size > 0 && moveTypes && moveTypes.size === 0 && (
        <p className="text-gray-600 text-sm italic mb-4">Selected attackers have no damaging moves.</p>
      )}

      {/* Type recommendations */}
      {sortedRecs && (
        <div className="mb-5 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-gray-800">
            <div className="text-xs font-semibold text-gray-300 mb-2">Recommend a move type to add</div>
            {/* Goal toggles */}
            <div className="flex flex-wrap gap-1.5">
              {visibleGoals.map(g => (
                <button
                  key={g.key}
                  onClick={() => setGoal(g.key)}
                  title={g.description}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    activeGoalKey === g.key
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{currentGoal.description}</p>
          </div>

          <div className="p-2 space-y-1">
            {(showAllRecs ? sortedRecs : sortedRecs.slice(0, 8)).map((r, i) => {
              const primary = currentGoal.primary(r);
              const secondary = currentGoal.secondary(r);
              return (
                <div
                  key={r.type}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded ${
                    i === 0 && !r.alreadyHave ? 'bg-gray-800 ring-1 ring-emerald-700' : 'bg-gray-850 hover:bg-gray-800'
                  }`}
                  style={i !== 0 || r.alreadyHave ? { backgroundColor: '#111827' } : {}}
                >
                  {/* Rank */}
                  <span className="text-xs text-gray-600 w-4 text-right shrink-0">{i + 1}</span>

                  {/* Type badge */}
                  <span
                    className="rounded px-2 py-0.5 text-white font-semibold shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[r.type] || '#888', fontSize: 11, minWidth: 52, textAlign: 'center' }}
                  >
                    {r.type}
                  </span>

                  {/* Primary score */}
                  <span className={`text-xs font-medium flex-1 ${i === 0 && !r.alreadyHave ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {primary}
                  </span>

                  {/* Secondary info */}
                  {secondary && (
                    <span className="text-xs text-gray-500">{secondary}</span>
                  )}

                  {/* Already have badge */}
                  {r.alreadyHave && (
                    <span className="text-xs text-gray-600 italic shrink-0">have</span>
                  )}

                  {/* Top badge */}
                  {i === 0 && !r.alreadyHave && (
                    <span className="text-xs bg-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded font-medium shrink-0">
                      top pick
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {sortedRecs.length > 8 && (
            <button
              onClick={() => setShowAllRecs(v => !v)}
              className="w-full text-xs text-gray-500 hover:text-gray-300 py-2 border-t border-gray-800 transition-colors"
            >
              {showAllRecs ? 'Show fewer ▲' : `Show all ${sortedRecs.length} types ▼`}
            </button>
          )}
        </div>
      )}

      {/* Effectiveness groups */}
      {groups && EFF_GROUPS.map(({ key, label, bg, text }) => {
        const list = groups[key] || [];
        const open = openGroups.has(key);
        return (
          <div key={key} className="mb-2 rounded-lg overflow-hidden border border-gray-800">
            <button
              className="w-full flex items-center justify-between px-3 py-2 text-left hover:brightness-110 transition-all"
              style={{ backgroundColor: bg }}
              onClick={() => toggleGroup(key)}
            >
              <span className="text-sm font-bold" style={{ color: text }}>{label}</span>
              <span className="text-xs" style={{ color: text }}>
                {list.length} Pokémon {open ? '▲' : '▼'}
              </span>
            </button>
            {open && (
              list.length === 0
                ? <div className="px-3 py-2 text-xs text-gray-600 italic bg-gray-950">None</div>
                : (
                  <div className="p-2 bg-gray-950 grid gap-1"
                    style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
                    {list.map(p => (
                      <div key={p.id} className="flex items-center gap-1.5 bg-gray-900 rounded px-1.5 py-1 min-w-0">
                        <img
                          src={p.artwork || p.sprite}
                          onError={e => { if (p.sprite) e.target.src = p.sprite; }}
                          alt="" className="w-8 h-8 object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-xs text-gray-200 truncate leading-tight">{toDisplayName(p.name)}</div>
                          <div className="flex gap-0.5 mt-0.5 flex-wrap">
                            {p.types.map(t => (
                              <span key={t} className="rounded text-white px-0.5"
                                style={{ backgroundColor: TYPE_COLORS[t], fontSize: 7, lineHeight: '13px' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>
        );
      })}
    </div>
  );
}
