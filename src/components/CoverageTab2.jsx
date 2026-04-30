import { useMemo, useState } from 'react';
import { calcAllStats, applyBoost } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { TIER_COLORS } from '../data/tierColors';
import { UI } from '../data/theme';

function getTier(minDmg, hp) {
  if (minDmg >= hp) return 2;
  if (minDmg * 2 > hp) return 1;
  return 0;
}

export default function CoverageTab2({ attackers, pokemonData, deselectedIds, weather, defSP, setDefSP }) {
  const eligible = attackers.filter(a => a.pokemon);
  const [sortMode, setSortMode] = useState('dex');
  const [openCards, setOpenCards] = useState(new Set());

  const toggleCard = id => setOpenCards(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

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
                sortMode === mode ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => {
          if (pokemonCards && openCards.size === pokemonCards.length) {
            setOpenCards(new Set());
          } else if (pokemonCards) {
            setOpenCards(new Set(pokemonCards.map(c => c.pokemon.id)));
          }
        }}
          className={`text-xs px-2 py-1 rounded transition-colors shrink-0 ${
            pokemonCards && openCards.size === pokemonCards.length ? 'bg-accent-meta text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}>
          {pokemonCards && openCards.size === pokemonCards.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Tier proportion bar */}
      {pokemonCards && (() => {
        const counts = [0, 0, 0];
        for (const c of pokemonCards) counts[c.cardTier]++;
        const total = pokemonCards.length;
        const segments = [2, 1, 0].filter(tier => counts[tier] > 0);
        return (
          <div className="flex h-5 shrink-0 mx-8 gap-px">
            {segments.map(tier => {
              const pct = counts[tier] / total;
              return (
                <div key={tier} className="flex items-center justify-center overflow-hidden"
                  style={{ flex: pct, backgroundColor: TIER_COLORS[tier].bg }}>
                  {pct >= 0.08 && (
                    <span className="font-bold select-none" style={{ fontSize: 10, color: UI.textOnLight }}>
                      {Math.round(pct * 100)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs text-gray-500 mb-3">How well your attackers can KO format Pokémon under the defender stats you set above. Green border = at least one attacker guaranteed OHKOs; yellow = at least one guaranteed 2HKOs; red = none. Hover a card to see per-attacker results.</p>
        {pokemonCards && (
          <div className="flex flex-wrap gap-2 content-start items-start">
            {pokemonCards.map(({ pokemon, attackerResults, cardTier }) => {
              const isOpen = openCards.has(pokemon.id);
              return (
                <div key={pokemon.id} className="rounded-lg p-2 flex flex-row items-center gap-2 overflow-hidden cursor-pointer"
                  style={{ background: TIER_COLORS[cardTier].bg, width: isOpen ? 180 : 112 }}
                  onClick={() => toggleCard(pokemon.id)}>
                  <img src={pokemon.artwork || pokemon.sprite}
                    onError={e => { if (pokemon.sprite) e.target.src = pokemon.sprite; }}
                    alt="" className="w-24 h-24 object-contain shrink-0" />
                  <div data-grid="" className="grid grid-cols-2 gap-1 h-24 content-start shrink-0 overflow-hidden"
                    style={{ display: isOpen ? 'grid' : 'none' }}>
                    {attackerResults.map(({ attacker, tier }) => (
                      <div key={attacker.id} className="rounded flex items-center justify-center"
                        style={{ backgroundColor: TIER_COLORS[tier].bg, width: 28, height: 28 }}>
                        <img
                          src={attacker.pokemon.artwork || attacker.pokemon.sprite}
                          onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
                          alt="" className="w-6 h-6 object-contain" />
                      </div>
                    ))}
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
