import { useMemo } from 'react';
import { calcAllStats, applyBoost } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { getEffectiveMove } from '../data/abilities';
import { ITEMS } from '../data/items';
import { TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';
import DamageBar from './DamageBar';
import { TIER_COLORS } from '../data/tierColors';

function bestDamageTier(damageRows, defHp) {
  let best = -1;
  for (const { rows } of damageRows) {
    for (const { result } of rows) {
      if (result.noEffect || result.immune) continue;
      const minPct = (result.minDmg / defHp) * 100;
      const tier = result.minDmg >= defHp ? 2 : minPct > 50 ? 1 : 0;
      if (tier > best) best = tier;
    }
  }
  return best;
}

export function DefenderDamageCard({ defender, attackers, weather, inlineHeader = false }) {
  const defStats = calcAllStats(defender.pokemon, defender.statPoints, defender.nature);
  const defBoosts = defender.boosts || {};

  const weatherDef = useMemo(() => {
    const types = defender.pokemon.types;
    const boostedDef = (weather === 'snow' && types.includes('ice'))
      ? Math.floor(defStats.def * 1.5) : defStats.def;
    const boostedSpd = (weather === 'sand' && types.includes('rock'))
      ? Math.floor(defStats.spd * 1.5) : defStats.spd;
    return {
      ...defStats,
      def: applyBoost(boostedDef, defBoosts.def || 0),
      spd: applyBoost(boostedSpd, defBoosts.spd || 0),
    };
  }, [defender.pokemon, defStats, weather, defBoosts]);

  const damageRows = useMemo(() => {
    return attackers.map(attacker => {
      const atkStats = calcAllStats(attacker.pokemon, attacker.statPoints, attacker.nature);
      const atkBoosts = attacker.boosts || {};
      const boostedAtk = applyBoost(atkStats.atk, atkBoosts.atk || 0);
      const boostedSpa = applyBoost(atkStats.spa, atkBoosts.spa || 0);
      const rows = (attacker.moves || []).map(move => {
        const isPhysical = move.category === 'physical';
        const isSpecial = move.category === 'special';
        const effMove = getEffectiveMove(move, attacker.ability, weather);
        if (!isPhysical && !isSpecial) return { move, effMove, result: { noEffect: true } };
        const atk = isPhysical ? boostedAtk : boostedSpa;
        const def = isPhysical ? weatherDef.def : weatherDef.spd;
        const result = calcDamage({
          bp: move.power, atk, def,
          moveName: move.name,
          attackerTypes: attacker.pokemon.types,
          moveType: move.type,
          moveCategory: move.category,
          defenderTypes: defender.pokemon.types,
          burned: attacker.burned,
          weather,
          item: attacker.item,
          ability: attacker.ability,
        });
        return { move, effMove, result };
      });
      return { attacker, rows };
    });
  }, [attackers, weatherDef, weather]);

  const cardTier = inlineHeader ? bestDamageTier(damageRows, defStats.hp) : undefined;
  const validTier = cardTier !== undefined && cardTier >= 0;

  const textPrimary = validTier ? '#111827' : undefined;
  const moveNameColor = '#374151';

  return (
    <div className="rounded-lg p-2 space-y-1 overflow-hidden"
      style={{ background: validTier ? TIER_COLORS[cardTier].bg : '#111827' }}>
      {inlineHeader ? (
        /* Inline header: attacker → defender on one row */
        <div className="flex items-center gap-1.5 flex-wrap">
          {damageRows[0] && (
            <>
              <img
                src={damageRows[0].attacker.pokemon.artwork || damageRows[0].attacker.pokemon.sprite}
                onError={e => { if (damageRows[0].attacker.pokemon.sprite) e.target.src = damageRows[0].attacker.pokemon.sprite; }}
                alt="" className="w-7 h-7 object-contain shrink-0"
              />
              <span className="font-semibold text-gray-200 truncate" style={{ fontSize: 13, color: textPrimary }}>{toDisplayName(damageRows[0].attacker.pokemon.name)}</span>
            </>
          )}
          <span style={{ fontSize: 13, color: moveNameColor }}>→</span>
          <img
            src={defender.pokemon.artwork || defender.pokemon.sprite}
            onError={e => { if (defender.pokemon.sprite) e.target.src = defender.pokemon.sprite; }}
            alt="" className="w-7 h-7 object-contain shrink-0"
          />
          <span className="font-semibold text-gray-200 truncate" style={{ fontSize: 13, color: textPrimary }}>{toDisplayName(defender.pokemon.name)}</span>
        </div>
      ) : (
        /* Standard header: defender prominent */
        <div className="flex items-center gap-2.5">
          <img
            src={defender.pokemon.artwork || defender.pokemon.sprite}
            onError={e => { if (defender.pokemon.sprite) e.target.src = defender.pokemon.sprite; }}
            alt="" className="w-11 h-11 object-contain shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-200 truncate">{toDisplayName(defender.pokemon.name)}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">HP <span className="font-mono text-gray-300">{defStats.hp}</span></span>
              <div className="flex gap-0.5">
                {defender.pokemon.types.map(t => (
                  <span key={t} className="text-white rounded px-1"
                    style={{ backgroundColor: TYPE_COLORS[t], fontSize: 8, lineHeight: '13px' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attacker damage rows — always white below the divider */}
      <div className="-mx-2 -mb-2 px-2 pb-2" style={{ background: '#ffffff', marginTop: 0 }}>
        {damageRows.length === 0 && (
          <div className="text-xs italic" style={{ color: '#6b7280' }}>No attackers selected.</div>
        )}
        <div className="space-y-1 border-t pt-1" style={{ borderColor: 'rgba(0,0,0,0.15)' }}>
        {damageRows.map(({ attacker, rows }) => (
          <div key={attacker.id}>
            {!inlineHeader && (
              <div className="flex items-center gap-1.5 mb-1">
                <img
                  src={attacker.pokemon.artwork || attacker.pokemon.sprite}
                  onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
                  alt="" className="w-6 h-6 object-contain shrink-0"
                />
                <span className="text-xs font-medium" style={{ color: '#374151' }}>{toDisplayName(attacker.pokemon.name)}</span>
              </div>
            )}
            {rows.length === 0 && (
              <div className={`text-xs italic ${!inlineHeader ? 'pl-7' : ''}`} style={{ color: moveNameColor }}>No moves</div>
            )}
            <div className={`space-y-1 ${!inlineHeader ? 'pl-7' : ''}`}>
              {rows.filter(r => !r.result.noEffect).map(({ move, effMove, result }) => (
                <div key={move.id} className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span style={{ fontSize: 11, color: moveNameColor }}>{toDisplayName(move.name)}</span>
                    <span className="text-xs px-1 rounded text-white"
                      style={{ backgroundColor: TYPE_COLORS[effMove.type] || '#888', fontSize: 9 }}>
                      {effMove.type !== move.type && (
                        <span className="opacity-50 line-through mr-0.5">{move.type}</span>
                      )}
                      {effMove.type}
                    </span>
                    {effMove.power !== move.power && (
                      <span className="text-xs" style={{ color: '#92400e' }}>{effMove.power} BP</span>
                    )}
                    {(() => {
                      const itemDef = attacker.item ? ITEMS[attacker.item] : null;
                      return itemDef?.effect === 'type-boost' && itemDef.type === effMove.type
                        ? <span className="text-xs" style={{ color: '#92400e' }}>{itemDef.label}</span>
                        : null;
                    })()}
                  </div>
                  <DamageBar
                    minDmg={result.minDmg}
                    maxDmg={result.maxDmg}
                    defenderHp={defStats.hp}
                    immune={result.immune}
                    noEffect={result.noEffect}
                    variant="white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}

function SelectorList({ label, items, deselected, onToggle, accentOn, accentOff }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</div>
      <div className="space-y-1">
        {items.map(item => {
          const active = !deselected.has(item.id);
          return (
            <button key={item.id} onClick={() => onToggle(item.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${active ? accentOn : accentOff}`}>
              <img
                src={item.pokemon.artwork || item.pokemon.sprite}
                onError={e => { if (item.pokemon.sprite) e.target.src = item.pokemon.sprite; }}
                alt="" className="w-7 h-7 object-contain shrink-0"
              />
              <span className="text-xs truncate">{toDisplayName(item.pokemon.name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DamageTab({ attackers, defenders, weather, deselAtk, setDeselAtk, deselDef, setDeselDef }) {
  const eligibleAtk = attackers.filter(a => a.pokemon);
  const eligibleDef = defenders.filter(d => d.pokemon);

  function toggleAtk(id) {
    setDeselAtk(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleDef(id) {
    setDeselDef(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }

  const selAtk = useMemo(() => eligibleAtk.filter(a => !deselAtk.has(a.id)), [eligibleAtk, deselAtk]);
  const selDef = useMemo(() => eligibleDef.filter(d => !deselDef.has(d.id)), [eligibleDef, deselDef]);

  if (eligibleAtk.length === 0 && eligibleDef.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Add Pokémon in the Setup tab first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Selector sidebar */}
      <div className="w-52 shrink-0 border-r border-gray-800 overflow-y-auto p-3 space-y-4 bg-gray-950">
        <SelectorList
          label="Attackers"
          items={eligibleAtk}
          deselected={deselAtk}
          onToggle={toggleAtk}
          accentOn="bg-blue-900/50 text-blue-200 border border-blue-800/40"
          accentOff="bg-gray-800 text-gray-500 hover:bg-gray-700"
        />
        <SelectorList
          label="Defenders"
          items={eligibleDef}
          deselected={deselDef}
          onToggle={toggleDef}
          accentOn="bg-orange-900/50 text-orange-200 border border-orange-800/40"
          accentOff="bg-gray-800 text-gray-500 hover:bg-gray-700"
        />
      </div>

      {/* Damage output */}
      <div className="flex-1 overflow-y-auto p-4">
        {selDef.length === 0 || selAtk.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            {selDef.length === 0 ? 'Select at least one defender.' : 'Select at least one attacker.'}
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {selDef.map(def => (
              <DefenderDamageCard key={def.id} defender={def} attackers={selAtk} weather={weather} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
