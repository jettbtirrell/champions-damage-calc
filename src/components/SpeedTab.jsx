import { useState, useMemo } from 'react';
import { calcAllStats } from '../utils/statCalc';
import { NATURES } from '../utils/natures';
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

function AttackerSection({ section, visibleGroups }) {
  const [open, setOpen] = useState(true);
  const { attacker, attackerSpe, faster, tied, slower } = section;
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
          {['faster', 'tied', 'slower'].filter(g => visibleGroups.has(g)).map(g => (
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

export default function SpeedTab({ attackers, pokemonData }) {
  const [comparisonMode, setComparisonMode] = useState('base');
  const [visibleGroups, setVisibleGroups] = useState(() => new Set(['faster', 'tied', 'slower']));

  function toggleGroup(g) {
    setVisibleGroups(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  }

  const sections = useMemo(() => {
    const eligible = attackers.filter(a => a.pokemon);
    return eligible.map(a => {
      const attackerSpe = calcAllStats(a.pokemon, a.statPoints, a.nature).spe;
      const faster = [], tied = [], slower = [];
      for (const p of pokemonData) {
        const compSpe = comparisonMode === 'base'
          ? p.stats.spe + 20
          : Math.floor(1.1 * (p.stats.spe + 52));
        const delta = compSpe - attackerSpe;
        const entry = { pokemon: p, compSpe, delta };
        if (delta > 0) faster.push(entry);
        else if (delta === 0) tied.push(entry);
        else slower.push(entry);
      }
      faster.sort((a, b) => a.delta - b.delta);
      slower.sort((a, b) => b.delta - a.delta);
      tied.sort((a, b) => a.pokemon.name.localeCompare(b.pokemon.name));
      return { attacker: a, attackerSpe, faster, tied, slower };
    });
  }, [attackers, pokemonData, comparisonMode]);

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

        {/* Group visibility */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Show:</span>
          {[
            { key: 'faster', label: 'Faster', on: 'bg-red-800 text-red-200',    off: 'bg-gray-700 text-gray-400' },
            { key: 'tied',   label: 'Tied',   on: 'bg-yellow-800 text-yellow-200', off: 'bg-gray-700 text-gray-400' },
            { key: 'slower', label: 'Slower', on: 'bg-green-900 text-green-200', off: 'bg-gray-700 text-gray-400' },
          ].map(({ key, label, on, off }) => (
            <button key={key} onClick={() => toggleGroup(key)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${visibleGroups.has(key) ? on : off}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Attacker sections */}
      <div className="p-4">
        {sections.map(section => (
          <AttackerSection
            key={section.attacker.id}
            section={section}
            visibleGroups={visibleGroups}
          />
        ))}
      </div>
    </div>
  );
}
