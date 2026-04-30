import { useState, useMemo } from 'react';
import { calcAllStats } from '../utils/statCalc';
import { ITEMS } from '../data/items';
import { toDisplayName } from '../utils/importExport';

function applyEnemyMods(spe, mods) {
  let s = spe;
  if (mods.tailwind)  s = Math.floor(s * 2);
  if (mods.scarf)     s = Math.floor(s * 1.5);
  if (mods.paralyzed) s = Math.floor(s * 0.5);
  return s;
}

function formatCompSpe(p, comparisonMode) {
  if (comparisonMode === 'min')  return Math.floor(0.9 * (p.stats.spe + 20));
  if (comparisonMode === 'max')  return Math.floor(1.1 * (p.stats.spe + 52));
  return p.stats.spe + 20; // base
}

// ─── Speed Chart ────────────────────────────────────────────────────────────

const ART = 28;

function SpeedNumberLine({ sections, defenders, pokemonData, comparisonMode, enemyMods }) {
  const { sortedSpeeds, formatBySpeed, attackersBySpeed, defendersBySpeed } = useMemo(() => {
    const attackerEntries = sections
      .filter(s => s.attacker.pokemon)
      .map(s => ({ attacker: s.attacker, spe: s.attackerSpe, scarfed: s.scarfed }));

    const defenderEntries = defenders
      .filter(d => d.pokemon)
      .map(d => {
        const baseSpe = calcAllStats(d.pokemon, d.statPoints, d.nature).spe;
        const scarfed = d.item === 'choice-scarf';
        return { defender: d, spe: scarfed ? Math.floor(baseSpe * 1.5) : baseSpe, scarfed };
      });

    const formatEntries = pokemonData.map(p => ({
      pokemon: p,
      spe: applyEnemyMods(formatCompSpe(p, comparisonMode), enemyMods),
    }));

    const allSpeeds = new Set([
      ...attackerEntries.map(a => a.spe),
      ...defenderEntries.map(d => d.spe),
      ...formatEntries.map(f => f.spe),
    ]);

    const fmtBySpeed = {};
    for (const f of formatEntries) (fmtBySpeed[f.spe] ??= []).push(f.pokemon);

    const atkBySpeed = {};
    for (const a of attackerEntries) (atkBySpeed[a.spe] ??= []).push(a);

    const defBySpeed = {};
    for (const d of defenderEntries) (defBySpeed[d.spe] ??= []).push(d);

    return {
      sortedSpeeds: [...allSpeeds].sort((a, b) => b - a),
      formatBySpeed: fmtBySpeed,
      attackersBySpeed: atkBySpeed,
      defendersBySpeed: defBySpeed,
    };
  }, [sections, defenders, pokemonData, comparisonMode, enemyMods]);

  if (sortedSpeeds.length === 0) return null;

  const hasDefenders = Object.keys(defendersBySpeed).length > 0;

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-950 overflow-hidden mt-4">
      <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400">Speed Chart</span>
      </div>

      {/* Column headers */}
      <div className="flex border-b border-gray-700 bg-gray-900">
        <div className="text-right pr-2 shrink-0 text-xs py-1.5 border-r border-gray-700"
          style={{ width: 140, color: 'var(--side-atk-label)' }}>
          Attackers
        </div>
        {hasDefenders && (
          <div className="text-right pr-2 shrink-0 text-xs py-1.5 border-r border-gray-700"
            style={{ width: 140, color: 'var(--side-def-label)' }}>
            Defenders
          </div>
        )}
        <div className="text-center shrink-0 text-xs text-gray-500 py-1.5 border-r border-gray-700"
          style={{ width: 44 }}>
          Spe
        </div>
        <div className="pl-2 text-xs text-gray-500 py-1.5">
          Format Pokémon
        </div>
      </div>

      {/* Rows */}
      <div>
        {sortedSpeeds.map(spe => {
          const atkList = attackersBySpeed[spe] || [];
          const defList = defendersBySpeed[spe] || [];
          const fmtList = formatBySpeed[spe] || [];
          const isAtkRow = atkList.length > 0;
          const isDefRow = defList.length > 0;

          return (
            <div
              key={spe}
              className="flex items-center border-b border-gray-800/40"
              style={{ background: isAtkRow ? 'var(--side-atk-row-bg)' : isDefRow ? 'var(--side-def-row-bg)' : undefined }}
            >
              {/* Attackers column */}
              <div
                className="flex items-center justify-end gap-1.5 pr-2 shrink-0 border-r border-gray-700 py-0.5"
                style={{ width: 140, minHeight: ART + 4 }}
              >
                {atkList.map(a => (
                  <div key={a.attacker.id} className="flex items-center gap-1">
                    {a.scarfed && (
                      <span className="font-bold shrink-0" style={{ fontSize: 9, color: 'var(--cond-scarf-text)' }}>Scarf</span>
                    )}
                    <span className="text-xs truncate text-right leading-tight"
                      style={{ maxWidth: 70, color: 'var(--side-atk-name)' }}>
                      {toDisplayName(a.attacker.pokemon.name)}
                    </span>
                    <img
                      src={a.attacker.pokemon.artwork || a.attacker.pokemon.sprite}
                      onError={e => { if (a.attacker.pokemon.sprite) e.target.src = a.attacker.pokemon.sprite; }}
                      alt=""
                      style={{ width: ART, height: ART, objectFit: 'contain', filter: 'drop-shadow(0 0 4px var(--side-atk-glow))' }}
                    />
                  </div>
                ))}
              </div>

              {/* Defenders column */}
              {hasDefenders && (
                <div
                  className="flex items-center justify-end gap-1.5 pr-2 shrink-0 border-r border-gray-700 py-0.5"
                  style={{ width: 140, minHeight: ART + 4 }}
                >
                  {defList.map(d => (
                    <div key={d.defender.id} className="flex items-center gap-1">
                      {d.scarfed && (
                        <span className="font-bold shrink-0" style={{ fontSize: 9, color: 'var(--cond-scarf-text)' }}>Scarf</span>
                      )}
                      <span className="text-xs truncate text-right leading-tight"
                        style={{ maxWidth: 70, color: 'var(--side-def-name)' }}>
                        {toDisplayName(d.defender.pokemon.name)}
                      </span>
                      <img
                        src={d.defender.pokemon.artwork || d.defender.pokemon.sprite}
                        onError={e => { if (d.defender.pokemon.sprite) e.target.src = d.defender.pokemon.sprite; }}
                        alt=""
                        style={{ width: ART, height: ART, objectFit: 'contain', filter: 'drop-shadow(0 0 4px var(--side-def-glow))' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Speed value */}
              <div className="flex items-center justify-center shrink-0 border-r border-gray-700 self-stretch"
                style={{ width: 44 }}>
                <span className={`text-xs font-mono ${(isAtkRow || isDefRow) ? 'font-bold' : 'text-gray-600'}`}
                  style={isAtkRow ? { color: 'var(--side-atk-speed)' } : isDefRow ? { color: 'var(--side-def-speed)' } : undefined}>
                  {spe}
                </span>
              </div>

              {/* Format Pokemon */}
              <div className="flex items-center flex-wrap gap-0.5 px-2 py-0.5">
                {fmtList.map(p => (
                  <img
                    key={p.id}
                    src={p.artwork || p.sprite}
                    onError={e => { if (p.sprite) e.target.src = p.sprite; }}
                    alt=""
                    title={toDisplayName(p.name)}
                    style={{ width: ART, height: ART, objectFit: 'contain' }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Tab ───────────────────────────────────────────────────────────────

export default function SpeedTab({ attackers, defenders, pokemonData }) {
  const [comparisonMode, setComparisonMode] = useState('max');
  const [enemyMods, setEnemyMods] = useState({ paralyzed: false, tailwind: false, scarf: false });

  function toggleMod(key) {
    setEnemyMods(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const sections = useMemo(() => {
    return attackers.filter(a => a.pokemon).map(a => {
      const baseSpe = calcAllStats(a.pokemon, a.statPoints, a.nature).spe;
      const scarfed = a.item === 'choice-scarf';
      const attackerSpe = scarfed ? Math.floor(baseSpe * 1.5) : baseSpe;
      const faster = [], tied = [], slower = [];
      for (const p of pokemonData) {
        const compSpe = applyEnemyMods(formatCompSpe(p, comparisonMode), enemyMods);
        const delta = compSpe - attackerSpe;
        const entry = { pokemon: p, compSpe, delta };
        if (delta > 0) faster.push(entry);
        else if (delta === 0) tied.push(entry);
        else slower.push(entry);
      }
      faster.sort((a, b) => a.delta - b.delta);
      slower.sort((a, b) => b.delta - a.delta);
      tied.sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));
      return { attacker: a, attackerSpe, scarfed, faster, tied, slower };
    });
  }, [attackers, pokemonData, comparisonMode, enemyMods]);

  if (sections.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Add a Pokémon to an attacker slot to see speed comparisons.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <p className="text-xs text-gray-500 px-4 pt-3 pb-1">Speed tiers for your attackers relative to format Pokémon. Use this to decide where to invest speed EVs — faster Pokémon act first and can KO before taking damage.</p>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-2.5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Format Pokémon Stats:</span>
          {[
            { key: 'min',  label: 'Min (0 EVs / −Spe)' },
            { key: 'base', label: 'Base (0 EVs / neutral)' },
            { key: 'max',  label: 'Max (32 EVs / +Spe)' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setComparisonMode(key)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                comparisonMode === key ? 'bg-accent text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Format Pokémon Conditions / Items:</span>
          {[
            { key: 'tailwind',  label: 'Tailwind',  bg: 'var(--cond-tailwind-bg)',  text: 'var(--cond-tailwind-text)'  },
            { key: 'scarf',     label: 'Scarf',     bg: 'var(--cond-scarf-bg)',     text: 'var(--cond-scarf-text)'     },
            { key: 'paralyzed', label: 'Paralyzed', bg: 'var(--cond-paralyzed-bg)', text: 'var(--cond-paralyzed-text)' },
          ].map(({ key, label, bg, text }) => (
            <button key={key} onClick={() => toggleMod(key)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${enemyMods[key] ? '' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
              style={enemyMods[key] ? { background: bg, color: text } : undefined}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <SpeedNumberLine
          sections={sections}
          defenders={defenders}
          pokemonData={pokemonData}
          comparisonMode={comparisonMode}
          enemyMods={enemyMods}
        />
      </div>
    </div>
  );
}
