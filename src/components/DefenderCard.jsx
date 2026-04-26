import { useMemo } from 'react';
import { NATURES, natureLabel } from '../utils/natures';
import { calcAllStats, applyBoost } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { getEffectiveMove } from '../data/abilities';
import { ITEMS } from '../data/items';
import { TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';
import PokemonSearch from './PokemonSearch';
import StatEditor from './StatEditor';
import DamageBar from './DamageBar';

export default function DefenderCard({ defender, onChange, onRemove, attackers, weather, pokemonData }) {
  const { pokemon, nature, statPoints } = defender;
  const defStats = calcAllStats(pokemon, statPoints, nature);

  const weatherDef = useMemo(() => {
    if (!pokemon) return defStats;
    const types = pokemon.types;
    const boostedSpd = (weather === 'sand' && types.includes('rock'))
      ? Math.floor(defStats.spd * 1.5) : defStats.spd;
    const boostedDef = (weather === 'snow' && types.includes('ice'))
      ? Math.floor(defStats.def * 1.5) : defStats.def;
    return { ...defStats, def: boostedDef, spd: boostedSpd };
  }, [pokemon, defStats, weather]);

  function update(patch) { onChange({ ...defender, ...patch }); }

  const damageRows = useMemo(() => {
    if (!pokemon) return [];
    return attackers
      .filter(a => a.pokemon)
      .map(attacker => {
        const atkStats = calcAllStats(attacker.pokemon, attacker.statPoints, attacker.nature);
        const atkBoosts = attacker.boosts || {};
        const boostedAtk = applyBoost(atkStats.atk, atkBoosts.atk || 0);
        const boostedSpa = applyBoost(atkStats.spa, atkBoosts.spa || 0);
        const rows = attacker.moves.map(move => {
          const isPhysical = move.category === 'physical';
          const isSpecial = move.category === 'special';
          const effMove = getEffectiveMove(move, attacker.ability, weather);
          if (!isPhysical && !isSpecial) {
            return { move, effMove, result: { minDmg: 0, maxDmg: 0, noEffect: true } };
          }
          const atk = isPhysical ? boostedAtk : boostedSpa;
          const def = isPhysical ? weatherDef.def : weatherDef.spd;
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
  }, [pokemon, attackers, weatherDef, weather]);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 space-y-3">
      {/* Header */}
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

          <div className="flex items-center gap-3 text-xs text-gray-300 bg-gray-800 rounded px-2 py-1.5 flex-wrap">
            <span><span className="text-gray-500">HP:</span> <span className="font-mono font-semibold text-white">{defStats.hp}</span></span>
            {weatherDef.def !== defStats.def && (
              <span><span className="text-gray-500">Def:</span> <span className="font-mono text-gray-400 line-through mr-1">{defStats.def}</span><span className="font-mono font-semibold text-cyan-400">{weatherDef.def}</span></span>
            )}
            {weatherDef.spd !== defStats.spd && (
              <span><span className="text-gray-500">SpD:</span> <span className="font-mono text-gray-400 line-through mr-1">{defStats.spd}</span><span className="font-mono font-semibold text-yellow-400">{weatherDef.spd}</span></span>
            )}
          </div>

          {/* Damage breakdown per attacker */}
          {damageRows.length > 0 && (
            <div className="space-y-2 border-t border-gray-800 pt-2">
              {damageRows.map(({ attacker, rows }) => (
                <div key={attacker.id}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {(attacker.pokemon.artwork || attacker.pokemon.sprite) && (
                      <img
                        src={attacker.pokemon.artwork || attacker.pokemon.sprite}
                        onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
                        alt="" className="w-7 h-7 object-contain"
                      />
                    )}
                    <span className="text-xs font-medium text-gray-300">{toDisplayName(attacker.pokemon.name)}</span>
                  </div>
                  {rows.length === 0 && (
                    <div className="text-xs text-gray-600 pl-6 italic">No moves</div>
                  )}
                  <div className="space-y-1 pl-6">
                    {rows.filter(({ result }) => !result.noEffect).map(({ move, result, effMove }) => (
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
                          {(() => {
                            const itemDef = attacker.item ? ITEMS[attacker.item] : null;
                            return itemDef?.effect === 'type-boost' && itemDef.type === effMove.type
                              ? <span className="text-xs text-amber-400 opacity-80">{itemDef.label}</span>
                              : null;
                          })()}
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
