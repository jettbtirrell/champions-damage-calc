import { useState, useMemo } from 'react';
import { getTypeEffectiveness, TYPE_COLORS } from '../data/typeChart';
import { getEffectiveMove } from '../data/abilities';
import { toDisplayName } from '../utils/importExport';

const ALL_TYPES = [
  'normal','fire','water','grass','electric','ice',
  'fighting','poison','ground','flying','psychic','bug',
  'rock','ghost','dragon','dark','steel','fairy',
];

const EFF_COLORS = {
  4:    { bg: '#7f1d1d', text: '#fca5a5' },
  2:    { bg: '#78350f', text: '#fcd34d' },
  1:    { bg: '#1f2937', text: '#6b7280' },
  0.5:  { bg: '#1e3a8a', text: '#93c5fd' },
  0.25: { bg: '#172554', text: '#93c5fd' },
  0:    { bg: '#111827', text: '#374151' },
};
const EFF_LABELS = { 4: '4×', 2: '2×', 1: '1×', 0.5: '½×', 0.25: '¼×', 0: '0×' };

const GOALS = [
  {
    key: 'super-effective',
    label: 'Most 2x+ coverage',
    description: 'Maximize Pokémon hit for 2x or better, weighted so unique coverage beats redundant overlap',
    sort: (a, b) => b.weightedScore - a.weightedScore || b.gained4x - a.gained4x,
    primary: r => `+${r.gained2xPlus} newly at 2x+`,
    secondary: r => r.gained4x > 0 ? `(+${r.gained4x} at 4x)` : null,
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
  const [goal, setGoal] = useState('super-effective');
  const [showAllRecs, setShowAllRecs] = useState(false);

  function toggleAttacker(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const { pokemonCards, moveTypes, recommendations } = useMemo(() => {
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

    if (types.size === 0) return { pokemonCards: null, moveTypes: types, recommendations: null };

    // Per-pokemon: best effectiveness from current team moves + 2x+ coverage depth
    const pokemonBests = pokemonData.map(p => {
      let best = 0;
      let depth = 0;
      for (const t of types) {
        const e = getTypeEffectiveness(t, p.types);
        if (e > best) best = e;
        if (e >= 2) depth++;
      }
      return { pokemon: p, best, depth };
    });

    // Recommendation scores for all 18 types
    const recs = ALL_TYPES.map(type => {
      let gained2xPlus = 0, total2xPlus = 0, gained4x = 0, total4x = 0;
      let pluggedImmune = 0, wallsAfter = 0, weightedScore = 0;

      for (const { pokemon, best: currentBest, depth } of pokemonBests) {
        const typeEff = getTypeEffectiveness(type, pokemon.types);
        const newBest = Math.max(currentBest, typeEff);
        if (newBest >= 2) total2xPlus++;
        if (newBest >= 4) total4x++;
        if (currentBest < 2 && newBest >= 2) gained2xPlus++;
        if (currentBest < 4 && newBest >= 4) gained4x++;
        if (currentBest === 0 && typeEff > 0) pluggedImmune++;
        if (newBest <= 0.5) wallsAfter++;
        // Diminishing returns: unique (depth=0) = 1.0, first overlap = 0.5, etc.
        if (typeEff >= 2) weightedScore += 1 / (depth + 1);
      }

      return {
        type, gained2xPlus, total2xPlus, gained4x, total4x,
        pluggedImmune, wallsAfter, weightedScore,
        alreadyHave: types.has(type),
      };
    });

    // Per-pokemon cards: best effectiveness each attacker can achieve
    const cards = pokemonData.map(p => {
      const attackerEffs = selected.map(atk => {
        let best = 0;
        let hasMove = false;
        for (const move of atk.moves) {
          if (!move.power || move.category === 'status') continue;
          hasMove = true;
          const { type } = getEffectiveMove(move, atk.ability);
          const eff = getTypeEffectiveness(type, p.types);
          if (eff > best) best = eff;
        }
        return { attacker: atk, eff: hasMove ? best : null };
      });
      const bestEff = attackerEffs.reduce((m, a) => Math.max(m, a.eff ?? 0), 0);
      const count2xPlus = attackerEffs.filter(a => (a.eff ?? 0) >= 2).length;
      return { pokemon: p, attackerEffs, bestEff, count2xPlus };
    });

    // Worst for us first: lowest best coverage, then fewest attackers at 2x+
    cards.sort((a, b) => a.bestEff - b.bestEff || a.count2xPlus - b.count2xPlus);

    return { pokemonCards: cards, moveTypes: types, recommendations: recs };
  }, [selectedIds, attackers, pokemonData]);

  const hasImmunities = pokemonCards ? pokemonCards.some(c => c.bestEff === 0) : false;
  const hasWalls = pokemonCards ? pokemonCards.some(c => c.bestEff <= 0.5) : false;
  const activeGoalKey =
    (!hasImmunities && goal === 'plug-immune') ? 'super-effective' :
    (!hasWalls && goal === 'minimize-walls') ? 'super-effective' : goal;
  const visibleGoals = GOALS.filter(g =>
    (g.key !== 'plug-immune' || hasImmunities) &&
    (g.key !== 'minimize-walls' || hasWalls)
  );
  const currentGoal = GOALS.find(g => g.key === activeGoalKey);
  const sortedRecs = recommendations ? [...recommendations].sort(currentGoal.sort) : null;

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
                <button key={a.id} onClick={() => toggleAttacker(a.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-colors ${
                    on ? 'bg-blue-700 border-blue-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                  }`}>
                  {(a.pokemon.artwork || a.pokemon.sprite) && (
                    <img src={a.pokemon.artwork || a.pokemon.sprite}
                      onError={e => { if (a.pokemon.sprite) e.target.src = a.pokemon.sprite; }}
                      alt="" className="w-6 h-6 object-contain" />
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

      {/* Type recommendation */}
      {sortedRecs && (
        <div className="mb-5 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-gray-800">
            <div className="text-xs font-semibold text-gray-300 mb-2">Recommend a move type to add</div>
            <div className="flex flex-wrap gap-1.5">
              {visibleGoals.map(g => (
                <button key={g.key} onClick={() => setGoal(g.key)} title={g.description}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    activeGoalKey === g.key ? 'bg-emerald-700 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}>
                  {g.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{currentGoal.description}</p>
          </div>

          <div className="p-2 space-y-1">
            {(showAllRecs ? sortedRecs : sortedRecs.slice(0, 1)).map((r, i) => {
              const primary = currentGoal.primary(r);
              const secondary = currentGoal.secondary(r);
              return (
                <div key={r.type}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded ${
                    i === 0 && !r.alreadyHave ? 'bg-gray-800 ring-1 ring-emerald-700' : 'hover:bg-gray-800'
                  }`}
                  style={i !== 0 || r.alreadyHave ? { backgroundColor: 'var(--acc-void-bg)' } : {}}>
                  <span className="text-xs text-gray-600 w-4 text-right shrink-0">{i + 1}</span>
                  <span className="rounded px-2 py-0.5 text-white font-semibold shrink-0"
                    style={{ backgroundColor: TYPE_COLORS[r.type] || '#888', fontSize: 11, minWidth: 52, textAlign: 'center' }}>
                    {r.type}
                  </span>
                  <span className={`text-xs font-medium flex-1 ${i === 0 && !r.alreadyHave ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {primary}
                  </span>
                  {secondary && <span className="text-xs text-gray-500">{secondary}</span>}
                  {r.alreadyHave && <span className="text-xs text-gray-600 italic shrink-0">have</span>}
                  {i === 0 && !r.alreadyHave && (
                    <span className="text-xs bg-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded font-medium shrink-0">top pick</span>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={() => setShowAllRecs(v => !v)}
            className="w-full text-xs text-gray-500 hover:text-gray-300 py-2 border-t border-gray-800 transition-colors">
            {showAllRecs ? 'Show fewer ▲' : `Show all ${sortedRecs.length} types ▼`}
          </button>
        </div>
      )}

      {/* Per-pokemon coverage cards — worst coverage first */}
      {pokemonCards && (
        <div className="space-y-1">
          {pokemonCards.map(({ pokemon, attackerEffs }) => (
            <div key={pokemon.id} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5">
              <img src={pokemon.artwork || pokemon.sprite}
                onError={e => { if (pokemon.sprite) e.target.src = pokemon.sprite; }}
                alt="" className="w-8 h-8 object-contain shrink-0" />
              <div className="shrink-0" style={{ minWidth: 110 }}>
                <div className="text-xs text-gray-200 truncate leading-tight">{toDisplayName(pokemon.name)}</div>
                <div className="flex gap-0.5 mt-0.5">
                  {pokemon.types.map(t => (
                    <span key={t} className="rounded text-white px-0.5"
                      style={{ backgroundColor: TYPE_COLORS[t], fontSize: 7, lineHeight: '13px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {attackerEffs.map(({ attacker, eff }) => {
                  const colors = eff === null ? { bg: '#1f2937', text: '#4b5563' } : EFF_COLORS[eff] ?? EFF_COLORS[1];
                  const label = eff === null ? '—' : EFF_LABELS[eff] ?? '1×';
                  return (
                    <div key={attacker.id} className="flex flex-col items-center gap-0.5">
                      <img src={attacker.pokemon.artwork || attacker.pokemon.sprite}
                        onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
                        alt="" className="w-6 h-6 object-contain" />
                      <span className="rounded font-bold text-center leading-none py-0.5 block"
                        style={{ backgroundColor: colors.bg, color: colors.text, fontSize: 8, minWidth: 22 }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
