import { useMemo } from 'react';
import { NATURES, natureLabel } from '../utils/natures';
import { calcAllStats } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { getEffectiveMove } from '../data/abilities';
import { TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';
import PokemonSearch from './PokemonSearch';
import StatEditor from './StatEditor';
import DamageBar from './DamageBar';

export default function DefenderCard({ defender, onChange, onRemove, attackers, weather, pokemonData }) {
  const { pokemon, nature, statPoints } = defender;
  const defStats = calcAllStats(pokemon, statPoints, nature);

  function update(patch) { onChange({ ...defender, ...patch }); }

  const damageRows = useMemo(() => {
    if (!pokemon) return [];
    return attackers
      .filter(a => a.pokemon)
      .map(attacker => {
        const atkStats = calcAllStats(attacker.pokemon, attacker.statPoints, attacker.nature);
        const rows = attacker.moves.map(move => {
          const isPhysical = move.category === 'physical';
          const isSpecial = move.category === 'special';
          const effMove = getEffectiveMove(move, attacker.ability);
          if (!isPhysical && !isSpecial) {
            return { move, effMove, result: { minDmg: 0, maxDmg: 0, noEffect: true } };
          }
          const atk = isPhysical ? atkStats.atk : atkStats.spa;
          const def = isPhysical ? defStats.def : defStats.spd;
          const result = calcDamage({
            bp: move.power,
            atk,
            def,
            moveName: move.name,
            attackerTypes: attacker.pokemon.types,
            moveType: move.type,
            moveCategory: move.category,
            defenderTypes: pokemon.types,
            burned: attacker.burned,
            weather,
            item: attacker.item,
            ability: attacker.ability,
          });
          return { move, effMove, result };
        });
        return { attacker, atkStats, rows };
      });
  }, [pokemon, attackers, defStats, weather]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        {pokemon?.sprite && (
          <img src={pokemon.sprite} alt={pokemon.name} className="w-12 h-12 object-contain shrink-0"
            style={{ imageRendering: 'pixelated' }} />
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

          <div>
            <div className="text-xs text-gray-500 mb-1.5">Stat Points</div>
            <StatEditor
              pokemon={pokemon}
              statPoints={statPoints}
              nature={nature}
              onChange={sp => update({ statPoints: sp })}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-300 bg-gray-800 rounded px-2 py-1.5">
            <span className="text-gray-500">HP:</span>
            <span className="font-mono font-semibold text-white">{defStats.hp}</span>
          </div>

          {/* Damage breakdown per attacker */}
          {damageRows.length > 0 && (
            <div className="space-y-2 border-t border-gray-800 pt-2">
              {damageRows.map(({ attacker, rows }) => (
                <div key={attacker.id}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {attacker.pokemon.sprite && (
                      <img src={attacker.pokemon.sprite} alt="" className="w-5 h-5 object-contain"
                        style={{ imageRendering: 'pixelated' }} />
                    )}
                    <span className="text-xs font-medium text-gray-300">{toDisplayName(attacker.pokemon.name)}</span>
                  </div>
                  {rows.length === 0 && (
                    <div className="text-xs text-gray-600 pl-6 italic">No moves</div>
                  )}
                  <div className="space-y-1 pl-6">
                    {rows.map(({ move, result, effMove }) => (
                      <div key={move.id} className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-400">{toDisplayName(move.name)}</span>
                          <span className="text-xs px-1 rounded text-white"
                            style={{ backgroundColor: TYPE_COLORS[effMove.type] || '#888', fontSize: 9 }}>
                            {effMove.type !== move.type && (
                              <span className="opacity-50 line-through mr-0.5">{move.type}</span>
                            )}
                            {effMove.type}
                          </span>
                          {effMove.power !== move.power && (
                            <span className="text-yellow-400 text-xs">{effMove.power} BP</span>
                          )}
                        </div>
                        <DamageBar
                          minDmg={result.minDmg}
                          maxDmg={result.maxDmg}
                          defenderHp={defStats.hp}
                          immune={result.immune}
                          noEffect={result.noEffect}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
