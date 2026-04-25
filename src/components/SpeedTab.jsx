import { useState, useMemo } from 'react';
import { calcAllStats } from '../utils/statCalc';
import { NATURES } from '../utils/natures';
import { ITEMS } from '../data/items';
import { TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';

const GROUP_CONFIG = {
  faster: { label: 'Faster',  bg: '#450a0a', text: '#fca5a5' },
  tied:   { label: 'Tied',    bg: '#3d3200', text: '#fde68a' },
  slower: { label: 'Slower',  bg: '#052e16', text: '#86efac' },
};

function natureSpeBadge(nature) {
  const n = NATURES[nature];
  if (!n) return null;
  if (n.plus === 'spe')   return { label: '+Spe', color: 'text-green-400' };
  if (n.minus === 'spe')  return { label: '−Spe', color: 'text-red-400' };
  return null;
}

function PokemonEntry({ pokemon, compSpe, delta }) {
  const deltaStr = delta === 0 ? '=' : delta > 0 ? `+${delta}` : `${delta}`;
  const deltaColor = delta === 0 ? 'text-gray-500' : delta > 0 ? 'text-red-400' : 'text-green-400';
  return (
    <div className="flex items-center gap-1.5 bg-gray-900 rounded px-1.5 py-1 min-w-0">
      <img
        src={pokemon.artwork || pokemon.sprite}
        onError={e => { if (pokemon.sprite) e.target.src = pokemon.sprite; }}
        alt="" className="w-8 h-8 object-contain shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-gray-200 truncate leading-tight">{toDisplayName(pokemon.name)}</span>
          <span className={`text-xs font-mono shrink-0 ${deltaColor}`}>{deltaStr}</span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <div className="flex gap-0.5 flex-wrap">
            {pokemon.types.map(t => (
              <span key={t} className="rounded text-white px-0.5"
                style={{ backgroundColor: TYPE_COLORS[t], fontSize: 7, lineHeight: '13px' }}>
                {t}
              </span>
            ))}
          </div>
          <span className="text-xs font-mono text-gray-500 shrink-0">{compSpe}</span>
        </div>
      </div>
    </div>
  );
}

function SpeedGroup({ group, entries, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = GROUP_CONFIG[group];
  return (
    <div className="rounded overflow-hidden border border-gray-800">
      <button
        className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:brightness-110 transition-all"
        style={{ backgroundColor: cfg.bg }}
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-xs font-bold" style={{ color: cfg.text }}>{cfg.label}</span>
        <span className="text-xs" style={{ color: cfg.text }}>{entries.length} {open ? '▲' : '▼'}</span>
      </button>
      {open && (
        entries.length === 0
          ? <div className="px-3 py-2 text-xs text-gray-600 italic bg-gray-950">None</div>
          : (
            <div className="p-2 bg-gray-950 grid gap-1"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {entries.map(e => (
                <PokemonEntry key={e.pokemon.id} {...e} />
              ))}
            </div>
          )
      )}
    </div>
  );
}

function AttackerSection({ section }) {
  const [open, setOpen] = useState(true);
  const { attacker, attackerSpe, scarfed, faster, tied, slower } = section;
  const badge = natureSpeBadge(attacker.nature);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden mb-3">
      {/* Header */}
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-800 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <img
          src={attacker.pokemon.artwork || attacker.pokemon.sprite}
          onError={e => { if (attacker.pokemon.sprite) e.target.src = attacker.pokemon.sprite; }}
          alt="" className="w-8 h-8 object-contain shrink-0"
        />
        <span className="text-sm font-medium text-gray-200">{toDisplayName(attacker.pokemon.name)}</span>
        <span className="font-mono text-blue-300 text-sm">{attackerSpe}</span>
        {scarfed && (
          <span className="text-xs font-semibold text-yellow-400">Scarf</span>
        )}
        {badge && (
          <span className={`text-xs font-semibold ${badge.color}`}>{badge.label}</span>
        )}
        <span className="text-xs text-gray-600 ml-auto mr-2">
          <span className="text-red-400">{faster.length}</span>
          <span className="text-gray-600"> / </span>
          <span className="text-yellow-400">{tied.length}</span>
          <span className="text-gray-600"> / </span>
          <span className="text-green-400">{slower.length}</span>
        </span>
        <span className="text-gray-600 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {/* Speed groups */}
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-800 pt-2">
          {['faster', 'tied', 'slower'].map(g => (
            <SpeedGroup
              key={g}
              group={g}
              entries={section[g]}
              defaultOpen={g !== 'tied'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Speed Chart (vertical) ─────────────────────────────────────────────────

const ART = 28; // artwork size px

function SpeedNumberLine({ sections, pokemonData, comparisonMode, enemyMods }) {
  const { sortedSpeeds, formatBySpeed, attackersBySpeed } = useMemo(() => {
    const attackerEntries = sections
      .filter(s => s.attacker.pokemon)
      .map(s => ({ attacker: s.attacker, spe: s.attackerSpe, scarfed: s.scarfed }));

    const formatEntries = pokemonData.map(p => {
      const rawSpe = comparisonMode === 'base'
        ? p.stats.spe + 20
        : Math.floor(1.1 * (p.stats.spe + 52));
      return { pokemon: p, spe: applyEnemyMods(rawSpe, enemyMods) };
    });

    const allSpeeds = new Set([
      ...attackerEntries.map(a => a.spe),
      ...formatEntries.map(f => f.spe),
    ]);

    const fmtBySpeed = {};
    for (const f of formatEntries) (fmtBySpeed[f.spe] ??= []).push(f.pokemon);

    const atkBySpeed = {};
    for (const a of attackerEntries) (atkBySpeed[a.spe] ??= []).push({ attacker: a.attacker, scarfed: a.scarfed });

    return {
      sortedSpeeds: [...allSpeeds].sort((a, b) => b - a), // fastest first
      formatBySpeed: fmtBySpeed,
      attackersBySpeed: atkBySpeed,
    };
  }, [sections, pokemonData, comparisonMode, enemyMods]);

  if (sortedSpeeds.length === 0) return null;

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-950 overflow-hidden mt-4">
      <div className="px-3 py-2 border-b border-gray-800 flex items-center gap-3">
        <span className="text-xs font-semibold text-gray-400">Speed Chart</span>
        <span className="text-xs text-gray-600">fastest → slowest, top to bottom</span>
      </div>

      {/* Column headers */}
      <div className="flex border-b border-gray-700 bg-gray-900">
        <div className="text-right pr-2 shrink-0 text-xs text-gray-500 py-1.5 border-r border-gray-700"
          style={{ width: 188 }}>
          Attackers
        </div>
        <div className="text-center shrink-0 text-xs text-gray-500 py-1.5 border-r border-gray-700"
          style={{ width: 44 }}>
          Spe
        </div>
        <div className="pl-2 text-xs text-gray-500 py-1.5">
          Format Pokémon
        </div>
      </div>

      {/* Speed rows — one per distinct speed value */}
      <div>
        {sortedSpeeds.map(spe => {
          const atkList = attackersBySpeed[spe] || [];
          const fmtList = formatBySpeed[spe] || [];
          const isAtkRow = atkList.length > 0;

          return (
            <div
              key={spe}
              className={`flex items-center border-b border-gray-800/40 ${isAtkRow ? 'bg-blue-950/25' : ''}`}
            >
              {/* Left: attacker artwork + name, right-aligned */}
              <div
                className="flex items-center justify-end gap-1.5 pr-2 shrink-0 border-r border-gray-700 py-0.5"
                style={{ width: 188, minHeight: ART + 4 }}
              >
                {atkList.map(a => (
                  <div key={a.attacker.id} className="flex items-center gap-1">
                    {a.scarfed && (
                      <span className="text-yellow-400 font-bold shrink-0" style={{ fontSize: 9 }}>Scarf</span>
                    )}
                    <span className="text-xs text-blue-200 truncate text-right leading-tight"
                      style={{ maxWidth: 90 }}>
                      {toDisplayName(a.attacker.pokemon.name)}
                    </span>
                    <img
                      src={a.attacker.pokemon.artwork || a.attacker.pokemon.sprite}
                      onError={e => { if (a.attacker.pokemon.sprite) e.target.src = a.attacker.pokemon.sprite; }}
                      alt=""
                      style={{
                        width: ART, height: ART, objectFit: 'contain',
                        filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.7))',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Center: speed value */}
              <div className="flex items-center justify-center shrink-0 border-r border-gray-700 self-stretch"
                style={{ width: 44 }}>
                <span className={`text-xs font-mono ${isAtkRow ? 'text-blue-300 font-bold' : 'text-gray-600'}`}>
                  {spe}
                </span>
              </div>

              {/* Right: format Pokemon artworks, wrapping */}
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

function applyEnemyMods(spe, mods) {
  let s = spe;
  if (mods.tailwind)  s = Math.floor(s * 2);
  if (mods.scarf)     s = Math.floor(s * 1.5);
  if (mods.paralyzed) s = Math.floor(s * 0.5);
  return s;
}

export default function SpeedTab({ attackers, pokemonData }) {
  const [comparisonMode, setComparisonMode] = useState('base');
  const [enemyMods, setEnemyMods] = useState({ paralyzed: false, tailwind: false, scarf: false });

  function toggleMod(key) {
    setEnemyMods(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const sections = useMemo(() => {
    const eligible = attackers.filter(a => a.pokemon);
    return eligible.map(a => {
      const baseSpe = calcAllStats(a.pokemon, a.statPoints, a.nature).spe;
      const scarfed = a.item === 'choice-scarf';
      const attackerSpe = scarfed ? Math.floor(baseSpe * 1.5) : baseSpe;
      const faster = [], tied = [], slower = [];
      for (const p of pokemonData) {
        const rawSpe = comparisonMode === 'base'
          ? p.stats.spe + 20
          : Math.floor(1.1 * (p.stats.spe + 52));
        const compSpe = applyEnemyMods(rawSpe, enemyMods);
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
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-2.5 flex flex-wrap items-center gap-4">
        {/* Comparison mode */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Compare:</span>
          {[
            { key: 'base', label: 'Base (0 EVs / neutral)' },
            { key: 'max',  label: 'Max (32 EVs / +Spe)' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setComparisonMode(key)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                comparisonMode === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Enemy modifiers */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Enemies:</span>
          {[
            { key: 'tailwind',  label: 'Tailwind',  on: 'bg-sky-700 text-sky-200' },
            { key: 'scarf',     label: 'Scarf',     on: 'bg-yellow-700 text-yellow-200' },
            { key: 'paralyzed', label: 'Paralyzed', on: 'bg-purple-800 text-purple-200' },
          ].map(({ key, label, on }) => (
            <button key={key} onClick={() => toggleMod(key)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${enemyMods[key] ? on : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

      </div>

      <div className="p-4">
        {/* Number line visualization */}
        <SpeedNumberLine
          sections={sections}
          pokemonData={pokemonData}
          comparisonMode={comparisonMode}
          enemyMods={enemyMods}
        />

        {/* Attacker sections */}
        <div className="mt-4">
          {sections.map(section => (
            <AttackerSection
              key={section.attacker.id}
              section={section}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
