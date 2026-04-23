import { NATURES, natureLabel } from '../utils/natures';
import { TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';
import { ABILITY_LABELS, getEffectiveMove } from '../data/abilities';
import { ITEMS, TYPE_BOOST_ITEMS } from '../data/items';
import PokemonSearch from './PokemonSearch';
import MoveSearch from './MoveSearch';
import StatEditor from './StatEditor';

const CAT_COLORS = { physical: '#f97316', special: '#818cf8', status: '#6b7280' };
const BOOST_STATS = [{ key: 'atk', label: 'Atk' }, { key: 'spa', label: 'SpA' }];
const BOOST_STAGES = [0, 1, 2, 3, 4, 5, 6];

export default function AttackerCard({ attacker, onChange, onRemove, pokemonData, movesData, index }) {
  const { pokemon, nature, statPoints, moves, burned, boosts = {} } = attacker;

  function update(patch) { onChange({ ...attacker, ...patch }); }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        {(pokemon?.artwork || pokemon?.sprite) && (
          <img
            src={pokemon.artwork || pokemon.sprite}
            onError={e => { if (pokemon.sprite) e.target.src = pokemon.sprite; }}
            alt={pokemon.name} className="w-14 h-14 object-contain shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <PokemonSearch
            value={pokemon}
            onChange={p => update({ pokemon: p })}
            pokemonData={pokemonData}
          />
          {pokemon && (
            <div className="flex gap-1 mt-1">
              {pokemon.types.map(t => (
                <span key={t} className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                  style={{ backgroundColor: TYPE_COLORS[t] || '#888', fontSize: 10 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <button onClick={onRemove}
          className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none shrink-0 px-1">
          ×
        </button>
      </div>

      {pokemon && (
        <>
          {/* Nature */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 w-14 shrink-0">Nature</label>
            <select
              value={nature}
              onChange={e => update({ nature: e.target.value })}
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {Object.keys(NATURES).map(n => (
                <option key={n} value={n}>{natureLabel(n)}</option>
              ))}
            </select>
          </div>

          {/* Stat points */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">Stat Points</div>
            <StatEditor
              pokemon={pokemon}
              statPoints={statPoints}
              nature={nature}
              onChange={sp => update({ statPoints: sp })}
              boosts={boosts}
            />
          </div>

          {/* Stat boosts */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">Boosts</div>
            <div className="space-y-1">
              {BOOST_STATS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 w-8 shrink-0">{label}</span>
                  <div className="flex gap-0.5">
                    {BOOST_STAGES.map(stage => (
                      <button
                        key={stage}
                        onClick={() => update({ boosts: { ...boosts, [key]: stage } })}
                        className={`w-7 py-0.5 text-xs rounded transition-colors ${
                          (boosts[key] || 0) === stage
                            ? 'bg-blue-600 text-white font-medium'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {stage === 0 ? '—' : `+${stage}`}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moves */}
          <div>
            <div className="text-xs text-gray-500 mb-1.5">Moves</div>
            <div className="space-y-1 mb-1.5">
              {moves.map((move, i) => {
                const eff = getEffectiveMove(move, attacker.ability);
                const typeChanged = eff.type !== move.type;
                const powerChanged = eff.power !== move.power;
                return (
                <div key={move.id} className="flex items-center gap-1.5 bg-gray-800 rounded px-2 py-1">
                  <span className="flex-1 text-xs text-gray-200">{toDisplayName(move.name)}</span>
                  <span className="text-xs px-1 py-0.5 rounded text-white"
                    style={{ backgroundColor: TYPE_COLORS[eff.type] || '#888', fontSize: 9 }}>
                    {typeChanged && <span className="opacity-60 line-through mr-0.5">{move.type}</span>}
                    {eff.type}
                  </span>
                  <span className="text-xs px-1 py-0.5 rounded text-white"
                    style={{ backgroundColor: CAT_COLORS[move.category] || '#888', fontSize: 9 }}>
                    {move.category}
                  </span>
                  <span className={`text-xs w-8 text-right ${powerChanged ? 'text-yellow-400' : 'text-gray-500'}`}>
                    {eff.power || '—'}{powerChanged && <span className="opacity-50 line-through ml-1 text-gray-500">{move.power}</span>}
                  </span>
                  <button
                    onClick={() => update({ moves: moves.filter((_, j) => j !== i) })}
                    className="text-gray-600 hover:text-red-400 text-sm ml-1 leading-none"
                  >×</button>
                </div>
                );
              })}
            </div>
            <MoveSearch
              movesData={movesData}
              existingMoves={moves}
              onAdd={m => update({ moves: [...moves, m] })}
            />
          </div>

          {/* Item + Ability */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Item</label>
              <select
                value={attacker.item || ''}
                onChange={e => update({ item: e.target.value || null })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">None</option>
                <optgroup label="Type Boosters (×1.2)">
                  {TYPE_BOOST_ITEMS.map(k => (
                    <option key={k} value={k}>{ITEMS[k].label}</option>
                  ))}
                </optgroup>
                <optgroup label="Choice Items">
                  <option value="choice-scarf">Choice Scarf</option>
                </optgroup>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Ability</label>
              <select
                value={attacker.ability || ''}
                onChange={e => update({ ability: e.target.value || null })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">None</option>
                {Object.entries(ABILITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Burn toggle (stubbed phase 2) */}
          <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
            <input type="checkbox" disabled checked={burned} onChange={() => {}}
              className="accent-orange-500" />
            <span className="text-xs text-gray-400">Burned <span className="text-gray-600">(phase 2)</span></span>
          </label>
        </>
      )}
    </div>
  );
}
