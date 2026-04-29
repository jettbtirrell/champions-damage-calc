import { useMemo, useState } from 'react';
import { calcAllStats, applyBoost } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';

const TIER_COLORS = {
  2: { bg: '#86efac', text: '#052e16', label: '✓' },
  1: { bg: '#fcd34d', text: '#451a03', label: '2H' },
  0: { bg: '#fca5a5', text: '#450a0a', label: '✕' },
};
const TIER_BORDER = {
  2: '#4ade80',
  1: '#facc15',
  0: '#f87171',
};
const TIER_BG = {
  2: '#071a0f',
  1: '#1a1600',
  0: '#1a0707',
};

function getTier(minDmg, hp) {
  if (minDmg >= hp) return 2;
  if (minDmg * 2 > hp) return 1;
  return 0;
}

export default function CoverageTab2({ attackers, pokemonData, deselectedIds, weather, defSP, setDefSP }) {
  const eligible = attackers.filter(a => a.pokemon);
  const [sortMode, setSortMode] = useState('dex');

  const pokemonCards = useMemo(() => {
    const selected = eligible.filter(a => !deselectedIds.has(a.id));
    if (selected.length === 0) return null;

    const defStatPoints = { hp: defSP.hp, atk: 0, def: defSP.def, spa: 0, spd: defSP.spd, spe: 0 };

    const nameToId = Object.fromEntries(pokemonData.map(p => [p.name, p.id]));

    const cards = pokemonData.map(p => {
      const defStats = calcAllStats(p, defStatPoints, 'hardy');
      const hp = defStats.hp;

      const attackerResults = selected.map(attacker => {
        const atkStats = calcAllStats(attacker.pokemon, attacker.statPoints, attacker.nature);
        const atkBoosts = attacker.boosts || {};
        const boostedAtk = applyBoost(atkStats.atk, atkBoosts.atk || 0);
        const boostedSpa = applyBoost(atkStats.spa, atkBoosts.spa || 0);

        let bestMinDmg = 0;

        for (const move of attacker.moves) {
          if (!move.power || move.category === 'status') continue;
          const isPhysical = move.category === 'physical';
          const atkStat = isPhysical ? boostedAtk : boostedSpa;
          const defStat = isPhysical ? defStats.def : defStats.spd;

          const result = calcDamage({
            bp: move.power,
            atk: atkStat,
            def: defStat,
            moveName: move.name,
            attackerTypes: attacker.pokemon.types,
            moveType: move.type,
            moveCategory: move.category,
            defenderTypes: p.types,
            ability: attacker.ability,
            weather: weather || 'none',
          });

          if (result.immune || result.noEffect) continue;
          if (result.minDmg > bestMinDmg) bestMinDmg = result.minDmg;
        }

        return { attacker, tier: getTier(bestMinDmg, hp), minDmg: bestMinDmg };
      });

      const cardTier = attackerResults.reduce((best, r) => Math.max(best, r.tier), 0);
      const totalPct = attackerResults.reduce((sum, r) => sum + r.minDmg / hp, 0);

      return { pokemon: p, attackerResults, cardTier, totalPct };
    });

    function dexKey(p) {
      const isMega = p.name.includes('-mega');
      const baseName = isMega ? p.name.replace(/-mega.*$/, '') : null;
      const baseId = baseName ? (nameToId[baseName] ?? p.id) : p.id;
      return [baseId, isMega ? 1 : 0, p.name];
    }
    function dexCmp(a, b) {
      const [ai, am, an] = dexKey(a.pokemon);
      const [bi, bm, bn] = dexKey(b.pokemon);
      return ai - bi || am - bm || an.localeCompare(bn);
    }

    if (sortMode === 'color') {
      cards.sort((a, b) => a.cardTier - b.cardTier || dexCmp(a, b));
    } else {
      cards.sort(dexCmp);
    }
    return cards;
  }, [deselectedIds, attackers, pokemonData, defSP, weather, sortMode]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sliders toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 bg-gray-950 shrink-0">
        {[['hp', 'HP'], ['def', 'Def'], ['spd', 'SpD']].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 flex-1">
            <span className="text-xs text-gray-400 w-7 shrink-0">{label}</span>
            <input type="range" min={0} max={32} value={defSP[key]}
              onChange={e => setDefSP(prev => ({ ...prev, [key]: Number(e.target.value) }))}
              className="flex-1 accent-blue-500 h-1" />
            <span className="text-xs font-mono text-gray-300 w-5 text-right shrink-0">{defSP[key]}</span>
          </label>
        ))}
        <div className="flex gap-1 shrink-0">
          {[['dex', 'Dex #'], ['color', 'Color']].map(([mode, label]) => (
            <button key={mode} onClick={() => setSortMode(mode)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                sortMode === mode ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tier proportion bar */}
      {pokemonCards && (() => {
        const counts = [0, 0, 0];
        for (const c of pokemonCards) counts[c.cardTier]++;
        const total = pokemonCards.length;
        return (
          <div className="flex h-2 shrink-0 mx-8">
            {[2, 1, 0].map(tier => counts[tier] > 0 && (
              <div key={tier} style={{ flex: counts[tier] / total, backgroundColor: TIER_BORDER[tier] }} />
            ))}
          </div>
        );
      })()}

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {pokemonCards && (
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {pokemonCards.map(({ pokemon, attackerResults, cardTier }) => {
              return (
                <div key={pokemon.id} className="border rounded-lg p-2 flex flex-col gap-1.5"
                  style={{ borderColor: TIER_BORDER[cardTier], background: TIER_BG[cardTier] }}>
                  <div className="flex items-center gap-1.5">
                    <img src={pokemon.artwork || pokemon.sprite}
                      onError={e => { if (pokemon.sprite) e.target.src = pokemon.sprite; }}
                      alt="" className="w-8 h-8 object-contain shrink-0" />
                    <div className="min-w-0">
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
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {attackerResults.map(({ attacker, tier }) => {
                      const colors = TIER_COLORS[tier];
                      return (
                        <div key={attacker.id} className="flex flex-col items-center gap-0.5">
                          <img src={attacker.pokemon.artwork || attacker.pokemon.sprite}
                            onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
                            alt="" className="w-7 h-7 object-contain" />
                          <span className="rounded font-bold text-center leading-none py-0.5 block w-full"
                            style={{ backgroundColor: colors.bg, color: colors.text, fontSize: 8 }}>
                            {colors.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
