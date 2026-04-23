import { useState, useMemo } from 'react';
import { getTypeEffectiveness, TYPE_COLORS } from '../data/typeChart';
import { getEffectiveMove } from '../data/abilities';
import { toDisplayName } from '../utils/importExport';

const EFF_GROUPS = [
  { key: 4,    label: '4×',           bg: '#450a0a', text: '#fca5a5', defaultOpen: true  },
  { key: 2,    label: '2×',           bg: '#7c2d12', text: '#fdba74', defaultOpen: true  },
  { key: 1,    label: 'Neutral (1×)', bg: '#1f2937', text: '#9ca3af', defaultOpen: false },
  { key: 0.5,  label: '½×',           bg: '#1e3a8a', text: '#bfdbfe', defaultOpen: false },
  { key: 0.25, label: '¼×',           bg: '#172554', text: '#93c5fd', defaultOpen: false },
  { key: 0,    label: 'Immune (0×)',   bg: '#111827', text: '#4b5563', defaultOpen: false },
];

export default function CoverageTab({ attackers, pokemonData }) {
  const eligible = attackers.filter(a => a.pokemon);
  const [selectedIds, setSelectedIds] = useState(() => new Set(eligible.map(a => a.id)));
  const [openGroups, setOpenGroups] = useState(
    () => new Set(EFF_GROUPS.filter(g => g.defaultOpen).map(g => g.key))
  );

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

  const { groups, moveTypes } = useMemo(() => {
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

    if (types.size === 0) return { groups: null, moveTypes: types };

    const g = { 0: [], 0.25: [], 0.5: [], 1: [], 2: [], 4: [] };
    for (const pokemon of pokemonData) {
      let maxEff = 0;
      for (const type of types) {
        const eff = getTypeEffectiveness(type, pokemon.types);
        if (eff > maxEff) maxEff = eff;
      }
      const bucket = g[maxEff];
      if (bucket) bucket.push(pokemon);
      else g[1].push(pokemon);
    }

    return { groups: g, moveTypes: types };
  }, [selectedIds, attackers, pokemonData]);

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
                  {a.pokemon.sprite && (
                    <img src={a.pokemon.sprite} alt="" className="w-6 h-6 object-contain"
                      style={{ imageRendering: 'pixelated' }} />
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
        <p className="text-gray-600 text-sm italic">Selected attackers have no damaging moves.</p>
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
