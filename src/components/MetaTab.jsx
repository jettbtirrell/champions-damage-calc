import { useState, useCallback } from 'react';
import metaData from '../data/meta.json';
import { toDisplayName } from '../utils/importExport';
import { TYPE_COLORS } from '../data/typeChart';

const TOP_N = 20;
const TOP_MOVES = 4;
const ADDED_MS = 1200;

export default function MetaTab({ pokemonData, movesData, onAddDefender }) {
  const [addedSet, setAddedSet] = useState(new Set());
  const topMon = Object.entries(metaData).slice(0, TOP_N);

  const handleAdd = useCallback((pokemon, metaMoves) => {
    if (addedSet.has(pokemon.name)) return;
    const moves = metaMoves
      .map(name => movesData.find(m => m.name === name))
      .filter(Boolean);
    onAddDefender(pokemon, moves);
    setAddedSet(prev => new Set([...prev, pokemon.name]));
    setTimeout(() => {
      setAddedSet(prev => { const next = new Set(prev); next.delete(pokemon.name); return next; });
    }, ADDED_MS);
  }, [addedSet, onAddDefender]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-gray-500">Usage data from 102 replays · Reg M-A ladder</span>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))' }}>
        {topMon.map(([name, data], index) => {
          const pokemon = pokemonData.find(p => p.name === name);
          const topMoves = Object.entries(data.moves).slice(0, TOP_MOVES);
          const topItem = Object.entries(data.items)[0];

          return (
            <div key={name} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              {/* Header */}
              <div className="flex items-center gap-2.5">
                <span className="text-gray-600 font-mono text-xs w-5 shrink-0 text-right">#{index + 1}</span>
                {pokemon && (
                  <img
                    src={pokemon.artwork || pokemon.sprite}
                    onError={e => { if (pokemon.sprite) e.target.src = pokemon.sprite; }}
                    alt=""
                    className="w-14 h-14 object-contain shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-semibold text-white truncate">{toDisplayName(name)}</span>
                    <span className="text-blue-400 font-mono text-sm shrink-0">{data.usage}%</span>
                  </div>
                  {pokemon && (
                    <div className="flex gap-1 mt-0.5">
                      {pokemon.types.map(t => (
                        <span key={t} className="text-white px-1 rounded"
                          style={{ backgroundColor: TYPE_COLORS[t], fontSize: 9, lineHeight: '14px' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {topItem && (
                    <span className="text-xs text-amber-400 mt-0.5 block truncate">
                      {toDisplayName(topItem[0])}
                      <span className="text-gray-600 ml-1">{topItem[1]}%</span>
                    </span>
                  )}
                </div>
              </div>

              {pokemon && (() => {
                const added = addedSet.has(pokemon.name);
                return (
                  <button
                    onClick={() => handleAdd(pokemon, Object.keys(data.moves).slice(0, TOP_MOVES))}
                    disabled={added}
                    className={`mt-2 w-full text-xs py-1 rounded transition-colors ${
                      added
                        ? 'bg-green-800 text-green-300 cursor-default'
                        : 'bg-gray-800 hover:bg-blue-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {added ? '✓ Added' : '+ Add as Defender'}
                  </button>
                );
              })()}

              {/* Move bars */}
              {topMoves.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {topMoves.map(([move, pct]) => (
                    <div key={move} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0 w-28 truncate">{toDisplayName(move)}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-mono w-7 text-right shrink-0">{pct}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
