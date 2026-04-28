import { useMemo } from 'react';
import { calcAllStats, applyBoost } from '../utils/statCalc';
import { calcDamage } from '../utils/damageCalc';
import { toDisplayName } from '../utils/importExport';

function applyWeatherDef(defStats, types, weather) {
  return {
    ...defStats,
    def: (weather === 'snow' && types.includes('ice')) ? Math.floor(defStats.def * 1.5) : defStats.def,
    spd: (weather === 'sand' && types.includes('rock')) ? Math.floor(defStats.spd * 1.5) : defStats.spd,
  };
}

function bestResult(attacker, defender, weather) {
  const atkStats = calcAllStats(attacker.pokemon, attacker.statPoints, attacker.nature);
  const atkBoosts = attacker.boosts || {};
  const boostedAtk = applyBoost(atkStats.atk, atkBoosts.atk || 0);
  const boostedSpa = applyBoost(atkStats.spa, atkBoosts.spa || 0);

  const defStats = calcAllStats(defender.pokemon, defender.statPoints, defender.nature);
  const defBoosts = defender.boosts || {};
  const wDef = applyWeatherDef(defStats, defender.pokemon.types, weather);
  const boostedWDef = {
    ...wDef,
    def: applyBoost(wDef.def, defBoosts.def || 0),
    spd: applyBoost(wDef.spd, defBoosts.spd || 0),
  };

  let best = null;
  let anyImmune = false;

  for (const move of (attacker.moves || [])) {
    if (move.category === 'status' || !move.power) continue;
    const isPhysical = move.category === 'physical';
    const atk = isPhysical ? boostedAtk : boostedSpa;
    const def = isPhysical ? boostedWDef.def : boostedWDef.spd;

    const result = calcDamage({
      bp: move.power,
      atk,
      def,
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

    if (result.immune) { anyImmune = true; continue; }
    if (!best || result.maxDmg > best.result.maxDmg) {
      best = { result, move };
    }
  }

  if (best) return { ...best, hp: defStats.hp };
  if (anyImmune) return { immune: true };
  return null;
}

function cellColors(minDmg, hp) {
  if (minDmg >= hp)      return { bg: '#86efac', border: '#15803d', text: '#052e16' }; // green: guaranteed OHKO
  if (minDmg / hp > 0.5) return { bg: '#fcd34d', border: '#b45309', text: '#451a03' }; // yellow: guaranteed >50%
  return                        { bg: '#fca5a5', border: '#b91c1c', text: '#450a0a' }; // red: not guaranteed >50%
}

const CELL_W = 96;
const CELL_H = 64;
const ROW_LABEL_W = 120;

function MatrixCell({ attacker, defender, weather }) {
  const data = useMemo(
    () => bestResult(attacker, defender, weather),
    [attacker, defender, weather]
  );

  if (!data) {
    return (
      <td className="p-0.5">
        <div className="flex items-center justify-center border rounded text-xs text-gray-700"
          style={{ width: CELL_W, height: CELL_H, backgroundColor: 'var(--matrix-empty-bg)', borderColor: 'var(--matrix-empty-border)' }}>
          —
        </div>
      </td>
    );
  }

  if (data.immune) {
    return (
      <td className="p-0.5">
        <div className="flex items-center justify-center border rounded text-xs text-gray-600"
          style={{ width: CELL_W, height: CELL_H, backgroundColor: 'var(--matrix-immune-bg)', borderColor: 'var(--matrix-immune-border)' }}>
          Immune
        </div>
      </td>
    );
  }

  const { result, move, hp } = data;
  const minPct = Math.round(result.minDmg / hp * 100);
  const maxPct = Math.round(result.maxDmg / hp * 100);
  const { bg, border, text } = cellColors(result.minDmg, hp);

  return (
    <td className="p-0.5">
      <div className="flex flex-col items-center justify-center border rounded gap-0.5 px-1"
        style={{ width: CELL_W, height: CELL_H, backgroundColor: bg, borderColor: border, color: text }}>
        <span className="font-mono font-semibold text-sm leading-tight">
          {minPct}–{maxPct}%
        </span>
        <span className="opacity-70 truncate leading-tight" style={{ fontSize: 9, maxWidth: CELL_W - 8 }}>
          {toDisplayName(move.name)}
        </span>
      </div>
    </td>
  );
}

export default function MatchupMatrix({ attackers, defenders, weather }) {
  const atkList = attackers.filter(a => a.pokemon);
  const defList = defenders.filter(d => d.pokemon);

  if (atkList.length === 0 || defList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Add attackers and defenders to see the matchup matrix.
      </div>
    );
  }

  const HEADER_BG = 'var(--matrix-header-bg)';
  const VERT_W = 20;

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="w-fit">
      <table style={{ minWidth: 'max-content', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: VERT_W }} />
            <th style={{ width: ROW_LABEL_W }} />
            <th colSpan={defList.length} className="p-0 pb-1 text-center align-bottom">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Defenders</span>
            </th>
          </tr>
          {/* Defender sprites — top + sides of defender box */}
          <tr>
            <th style={{ width: VERT_W }} />
            <th style={{ width: ROW_LABEL_W }} />
            {defList.map((def, ci) => (
              <th key={def.id} className="p-0 pb-3 pt-2 text-center" style={{
                width: CELL_W + 4,
                backgroundColor: HEADER_BG,
                borderRadius: ci === 0 ? '8px 0 0 8px' : ci === defList.length - 1 ? '0 8px 8px 0' : undefined,
              }}>
                <div className="flex flex-col items-center gap-0.5 px-1">
                  <img
                    src={def.pokemon.artwork || def.pokemon.sprite}
                    onError={e => { if (def.pokemon.sprite) e.target.src = def.pokemon.sprite; }}
                    alt="" className="w-10 h-10 object-contain"
                  />
                  <span className="text-xs text-gray-300 leading-tight text-center truncate" style={{ maxWidth: CELL_W }}>
                    {toDisplayName(def.pokemon.name)}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {atkList.map((atk, ri) => (
            <tr key={atk.id}>
              {/* Vertical "Attackers" label — rowspan, centered beside the box */}
              {ri === 0 && (
                <td rowSpan={atkList.length} className="pr-2 text-center" style={{ width: VERT_W, verticalAlign: 'middle' }}>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>
                    Attackers
                  </span>
                </td>
              )}
              <td className="px-3 py-2" style={{
                backgroundColor: HEADER_BG,
                borderRadius: ri === 0 ? '8px 8px 0 0' : ri === atkList.length - 1 ? '0 0 8px 8px' : undefined,
              }}>
                <div className="flex items-center gap-2" style={{ width: ROW_LABEL_W }}>
                  <img
                    src={atk.pokemon.artwork || atk.pokemon.sprite}
                    onError={e => { if (atk.pokemon.sprite) e.target.src = atk.pokemon.sprite; }}
                    alt="" className="w-8 h-8 object-contain shrink-0"
                  />
                  <span className="text-xs text-gray-300 truncate" style={{ maxWidth: 72 }}>
                    {toDisplayName(atk.pokemon.name)}
                  </span>
                </div>
              </td>
              {defList.map(def => (
                <td key={def.id} className="p-0.5">
                  <MatrixCell attacker={atk} defender={def} weather={weather} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
        <span className="font-medium text-gray-400"></span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#86efac' }} />
          Guaranteed OHKO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#fcd34d' }} />
          Guaranteed 2HKO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: '#fca5a5' }} />
          Not guaranteed 2HKO
        </span>
      </div>
      </div>
    </div>
  );
}
