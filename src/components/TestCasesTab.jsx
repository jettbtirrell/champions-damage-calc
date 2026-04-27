import { useMemo } from 'react';
import { calcAllStats } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { toDisplayName } from '../utils/importExport';

// ─── Hardcoded meta threats (attack your defenders) ────────────────────────

const THREATS = [
  {
    id: 'sneasler-cc',
    attackerName: 'sneasler',
    label: 'Sneasler — Close Combat',
    subtitle: 'Max Atk · Jolly',
    statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
    nature: 'jolly',
    move: { name: 'close-combat', power: 120, type: 'fighting', category: 'physical' },
    weather: 'none', item: null, ability: null,
  },
  {
    id: 'charizard-heatwave',
    attackerName: 'charizard-mega-y',
    label: 'Mega Charizard Y — Heat Wave',
    subtitle: 'Max SpA · Modest · Sun',
    statPoints: { hp: 0, atk: 0, def: 0, spa: 32, spd: 0, spe: 0 },
    nature: 'modest',
    move: { name: 'heat-wave', power: 95, type: 'fire', category: 'special' },
    weather: 'sun', item: null, ability: null,
  },
  {
    id: 'kingambit-sucker',
    attackerName: 'kingambit',
    label: 'Kingambit — Sucker Punch',
    subtitle: 'Max Atk · Adamant',
    statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 },
    nature: 'adamant',
    move: { name: 'sucker-punch', power: 70, type: 'dark', category: 'physical' },
    weather: 'none', item: null, ability: null,
  },
  {
    id: 'garchomp-eq',
    attackerName: 'garchomp',
    label: 'Garchomp — Earthquake',
    subtitle: 'Max Atk · Adamant',
    statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 },
    nature: 'adamant',
    move: { name: 'earthquake', power: 100, type: 'ground', category: 'physical' },
    weather: 'none', item: null, ability: null,
  },
  {
    id: 'aerodactyl-rockslide',
    attackerName: 'aerodactyl',
    label: 'Aerodactyl — Rock Slide',
    subtitle: 'Max Atk · Jolly',
    statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
    nature: 'jolly',
    move: { name: 'rock-slide', power: 75, type: 'rock', category: 'physical' },
    weather: 'none', item: null, ability: null,
  },
];

// ─── Hardcoded meta targets (your attackers try to KO these) ───────────────

const TARGETS = [
  {
    id: 'farigiraf-bulky',
    defenderName: 'farigiraf',
    label: 'Bulky Farigiraf',
    subtitle: '32 HP / 32 SpD · Calm',
    statPoints: { hp: 32, atk: 0, def: 0, spa: 0, spd: 32, spe: 0 },
    nature: 'calm',
  },
  {
    id: 'sneasler-standard',
    defenderName: 'sneasler',
    label: 'Sneasler',
    subtitle: 'Max Atk / Spe · Jolly',
    statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 },
    nature: 'jolly',
  },
  {
    id: 'incineroar-standard',
    defenderName: 'incineroar',
    label: 'Incineroar',
    subtitle: '0 EVs · Adamant',
    statPoints: { hp: 0, atk: 32, def: 0, spa: 0, spd: 0, spe: 0 },
    nature: 'adamant',
  },
  {
    id: 'garchomp-bulky',
    defenderName: 'garchomp',
    label: 'Bulky Garchomp',
    subtitle: '32 HP / 32 Def · Impish',
    statPoints: { hp: 32, atk: 0, def: 32, spa: 0, spd: 0, spe: 0 },
    nature: 'impish',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function applyWeatherDef(defStats, types, weather) {
  return {
    ...defStats,
    def: (weather === 'snow' && types.includes('ice')) ? Math.floor(defStats.def * 1.5) : defStats.def,
    spd: (weather === 'sand' && types.includes('rock')) ? Math.floor(defStats.spd * 1.5) : defStats.spd,
  };
}

function pctLabel(min, max) { return `${min}–${max}%`; }

// ─── Sub-components ─────────────────────────────────────────────────────────

function SurviveChip({ mon, result, hp }) {
  const minPct = Math.round(result.minDmg / hp * 100);
  const maxPct = Math.round(result.maxDmg / hp * 100);
  const guaranteed = !result.immune && minPct >= 100;
  const ko         = !result.immune && maxPct >= 100;

  const chipCls = result.immune
    ? 'border-gray-700 bg-gray-900'
    : guaranteed
    ? 'border-red-800 bg-red-950/50'
    : ko
    ? 'border-orange-800 bg-orange-950/40'
    : 'border-green-900 bg-green-950/40';

  const pctCls = result.immune ? 'text-gray-600'
    : guaranteed ? 'text-red-400'
    : ko ? 'text-orange-400'
    : 'text-green-400';

  return (
    <div className={`flex items-center gap-1.5 rounded px-1.5 py-1 border ${chipCls}`}>
      <img
        src={mon.pokemon.artwork || mon.pokemon.sprite}
        onError={e => { if (mon.pokemon.sprite) e.target.src = mon.pokemon.sprite; }}
        alt="" className="w-7 h-7 object-contain shrink-0"
      />
      <div style={{ minWidth: 64 }}>
        <div className="text-xs text-gray-300 leading-tight truncate" style={{ maxWidth: 90 }}>
          {toDisplayName(mon.pokemon.name)}
        </div>
        <div className={`text-xs font-mono leading-tight ${pctCls}`}>
          {result.immune ? 'Immune' : pctLabel(minPct, maxPct)}
        </div>
      </div>
    </div>
  );
}

function ThreatCard({ threat }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-800">
        <img
          src={threat.atkPokemon.artwork || threat.atkPokemon.sprite}
          onError={e => { if (threat.atkPokemon.sprite) e.target.src = threat.atkPokemon.sprite; }}
          alt="" className="w-10 h-10 object-contain shrink-0"
        />
        <div>
          <div className="text-sm font-semibold text-gray-100">{threat.label}</div>
          <div className="text-xs text-gray-500">{threat.subtitle}</div>
        </div>
      </div>
      {threat.results.length === 0
        ? <div className="px-3 py-2 text-xs text-gray-600 italic">No Pokémon in your team to check.</div>
        : (
          <div className="p-2 flex flex-wrap gap-2">
            {threat.results.map(({ mon, hp, result }) => (
              <SurviveChip key={mon.id} mon={mon} result={result} hp={hp} />
            ))}
          </div>
        )
      }
    </div>
  );
}

function TargetCard({ target }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-800">
        <img
          src={target.defPokemon.artwork || target.defPokemon.sprite}
          onError={e => { if (target.defPokemon.sprite) e.target.src = target.defPokemon.sprite; }}
          alt="" className="w-10 h-10 object-contain shrink-0"
        />
        <div>
          <div className="text-sm font-semibold text-gray-100">{target.label}</div>
          <div className="text-xs text-gray-500">{target.subtitle} · HP {target.defStats.hp}</div>
        </div>
      </div>
      <div className="p-2 divide-y divide-gray-800">
        {target.results.map(({ attacker, moveResults }) => (
          <div key={attacker.id} className="flex items-start gap-2 py-2 first:pt-0 last:pb-0">
            <img
              src={attacker.pokemon.artwork || attacker.pokemon.sprite}
              onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
              alt="" className="w-7 h-7 object-contain shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 mb-1">{toDisplayName(attacker.pokemon.name)}</div>
              {moveResults.length === 0
                ? <span className="text-xs text-gray-700 italic">No damaging moves</span>
                : (
                  <div className="flex flex-wrap gap-1">
                    {moveResults.map(({ move, result }) => {
                      const minPct = Math.round(result.minDmg / target.defStats.hp * 100);
                      const maxPct = Math.round(result.maxDmg / target.defStats.hp * 100);
                      const ko = !result.immune && !result.noEffect && maxPct >= 100;
                      return (
                        <div key={move.id}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${ko ? 'bg-green-900/50 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
                          <span className={ko ? 'text-green-300' : 'text-gray-400'}>{toDisplayName(move.name)}</span>
                          <span className={`font-mono ${ko ? 'text-green-400' : 'text-gray-600'}`}>
                            {result.immune ? 'immune' : result.noEffect ? '—' : pctLabel(minPct, maxPct)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Tab ───────────────────────────────────────────────────────────────

export default function TestCasesTab({ attackers, defenders, pokemonData }) {
  const team = useMemo(() =>
    [...attackers, ...defenders].filter(m => m.pokemon),
    [attackers, defenders]
  );

  const threatResults = useMemo(() =>
    THREATS.map(threat => {
      const atkPokemon = pokemonData.find(p => p.name === threat.attackerName);
      if (!atkPokemon) return null;
      const atkStats = calcAllStats(atkPokemon, threat.statPoints, threat.nature);
      const atk = threat.move.category === 'physical' ? atkStats.atk : atkStats.spa;

      const results = team.map(mon => {
        const defStats = calcAllStats(mon.pokemon, mon.statPoints, mon.nature);
        const wDef = applyWeatherDef(defStats, mon.pokemon.types, threat.weather);
        const def = threat.move.category === 'physical' ? wDef.def : wDef.spd;
        const result = calcDamage({
          bp: threat.move.power, atk, def,
          moveName: threat.move.name,
          attackerTypes: atkPokemon.types,
          moveType: threat.move.type,
          moveCategory: threat.move.category,
          defenderTypes: mon.pokemon.types,
          weather: threat.weather,
          item: threat.item,
          ability: threat.ability,
        });
        return { mon, hp: defStats.hp, result };
      });

      return { ...threat, atkPokemon, results };
    }).filter(Boolean),
    [team, pokemonData]
  );

  const targetResults = useMemo(() =>
    TARGETS.map(target => {
      const defPokemon = pokemonData.find(p => p.name === target.defenderName);
      if (!defPokemon) return null;
      const defStats = calcAllStats(defPokemon, target.statPoints, target.nature);

      const results = attackers.filter(a => a.pokemon).map(attacker => {
        const atkStats = calcAllStats(attacker.pokemon, attacker.statPoints, attacker.nature);
        const moveResults = (attacker.moves || [])
          .filter(m => m.category !== 'status' && m.power > 0)
          .map(move => {
            const atk = move.category === 'physical' ? atkStats.atk : atkStats.spa;
            const def = move.category === 'physical' ? defStats.def : defStats.spd;
            const result = calcDamage({
              bp: move.power, atk, def,
              moveName: move.name,
              attackerTypes: attacker.pokemon.types,
              moveType: move.type,
              moveCategory: move.category,
              defenderTypes: defPokemon.types,
              weather: 'none',
              item: attacker.item,
              ability: attacker.ability,
            });
            return { move, result };
          });
        return { attacker, moveResults };
      });

      return { ...target, defPokemon, defStats, results };
    }).filter(Boolean),
    [attackers, pokemonData]
  );

  if (team.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Add Pokémon to your team to run test cases.
      </div>
    );
  }

  const hasOffensive = attackers.some(a => a.pokemon && a.moves?.some(m => m.power > 0));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-gray-300 mb-3">Can your team survive these threats?</h2>
        <div className="space-y-3">
          {threatResults.map(threat => <ThreatCard key={threat.id} threat={threat} />)}
        </div>
      </section>

      {hasOffensive && (
        <section>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Can your attackers KO these targets?</h2>
          <div className="space-y-3">
            {targetResults
              .filter(t => t.results.some(r => r.moveResults.length > 0))
              .map(target => <TargetCard key={target.id} target={target} />)
            }
          </div>
        </section>
      )}
    </div>
  );
}
