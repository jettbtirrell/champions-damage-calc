import { useState, useMemo, useEffect, useRef } from 'react';
import { toDisplayName } from './utils/importExport';
import pokemonData from './data/pokemon.json';
import movesData from './data/moves.json';
import AttackerCard from './components/AttackerCard';
import DefenderCard from './components/DefenderCard';
import ImportExportModal from './components/ImportExportModal';
import TypeChartTab from './components/TypeChartTab';
import PokemonSearch from './components/PokemonSearch';
import CoverageTab from './components/CoverageTab';
import SpeedTab from './components/SpeedTab';
import MetaTab from './components/MetaTab';
import RolesTab from './components/RolesTab';
import TestCasesTab from './components/TestCasesTab';
import MatchupMatrix from './components/MatchupMatrix';
import { DefenderDamageCard } from './components/DamageTab';
import { FORMATS, FORMAT_OPTIONS } from './data/formats';
import metaData from './data/meta.json';

const META_TOP_30 = new Set(Object.keys(metaData).slice(0, 30));

const WEATHER_OPTIONS = ['none', 'sun', 'rain', 'sand', 'snow'];
const WEATHER_LABELS  = { none: '—', sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow' };
const WEATHER_ACTIVE  = {
  none: 'bg-gray-600 text-white',
  sun:  'bg-orange-600 text-white',
  rain: 'bg-blue-600 text-white',
  sand: 'bg-yellow-700 text-white',
  snow: 'bg-cyan-700 text-white',
};

const ALL_TABS = ['setup', 'damage', 'matrix', 'types', 'coverage', 'speed', 'roles', 'tests', 'meta'];

function makeAttacker() {
  return {
    id: crypto.randomUUID(),
    pokemon: null,
    nature: 'hardy',
    statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: [],
    item: null,
    ability: null,
    burned: false,
    boosts: { atk: 0, spa: 0, def: 0, spd: 0 },
  };
}

function makeDefender() {
  return makeAttacker();
}

export default function App() {
  const [attackers, setAttackers] = useState([]);
  const [defenders, setDefenders] = useState([]);
  const [weather, setWeather] = useState('none');
  const [format, setFormat] = useState('reg-ma');
  const [weatherOpen, setWeatherOpen] = useState(false);
  const [atkModal, setAtkModal] = useState(false);
  const [defModal, setDefModal] = useState(false);
  const [tab, setTab] = useState('setup');
  const [atkSearchKey, setAtkSearchKey] = useState(0);
  const [defSearchKey, setDefSearchKey] = useState(0);
  const [selectedAtkId, setSelectedAtkId] = useState(null);
  const [selectedDefId, setSelectedDefId] = useState(null);
  const [atkShowAdd, setAtkShowAdd] = useState(false);
  const [defShowAdd, setDefShowAdd] = useState(false);
  const [metaMode, setMetaMode] = useState(false);
  const weatherTimerRef = useRef(null);

  const filteredPokemon = useMemo(
    () => pokemonData.filter(FORMATS[format].filter),
    [format]
  );

  const speedCovData = useMemo(() => {
    if (metaMode && format === 'reg-ma')
      return filteredPokemon.filter(p => META_TOP_30.has(p.name));
    return filteredPokemon;
  }, [metaMode, format, filteredPokemon]);

  const eligibleAtk = attackers.filter(a => a.pokemon);
  const eligibleDef = defenders.filter(d => d.pokemon);

  const selectedAtk = atkShowAdd ? null
    : (attackers.find(a => a.id === selectedAtkId) ?? eligibleAtk[0] ?? null);
  const selectedDef = defShowAdd ? null
    : (defenders.find(d => d.id === selectedDefId) ?? eligibleDef[0] ?? null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key !== 'Tab') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      setTab(t => {
        const idx = ALL_TABS.indexOf(t);
        return e.shiftKey
          ? ALL_TABS[(idx - 1 + ALL_TABS.length) % ALL_TABS.length]
          : ALL_TABS[(idx + 1) % ALL_TABS.length];
      });
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  function updateAttacker(id, patch) {
    setAttackers(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }
  function removeAttacker(id) {
    setAttackers(prev => {
      const next = prev.filter(a => a.id !== id);
      if (selectedAtkId === id) {
        const idx = prev.findIndex(a => a.id === id);
        setSelectedAtkId(next[Math.max(0, idx - 1)]?.id ?? null);
      }
      return next;
    });
  }
  function addAttackerWithPokemon(p) {
    if (attackers.length >= 6) return;
    const entry = { ...makeAttacker(), pokemon: p };
    setAttackers(prev => [...prev, entry]);
    setSelectedAtkId(entry.id);
    setAtkShowAdd(false);
    setAtkSearchKey(k => k + 1);
  }

  function updateDefender(id, patch) {
    setDefenders(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  }
  function removeDefender(id) {
    setDefenders(prev => {
      const next = prev.filter(d => d.id !== id);
      if (selectedDefId === id) {
        const idx = prev.findIndex(d => d.id === id);
        setSelectedDefId(next[Math.max(0, idx - 1)]?.id ?? null);
      }
      return next;
    });
  }
  function addDefenderWithPokemon(p) {
    if (defenders.length >= 6) return;
    const entry = { ...makeDefender(), pokemon: p };
    setDefenders(prev => [...prev, entry]);
    setSelectedDefId(entry.id);
    setDefShowAdd(false);
    setDefSearchKey(k => k + 1);
  }

  function swapSides() {
    setAttackers(defenders);
    setDefenders(attackers);
    setSelectedAtkId(selectedDefId);
    setSelectedDefId(selectedAtkId);
    setAtkShowAdd(defShowAdd);
    setDefShowAdd(atkShowAdd);
  }

  const showSharedHeader = true;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">Pokémin-max</span>
          <div className="flex gap-1">
            {[['setup', 'Setup'], ['damage', 'Damage'], ['matrix', 'Matrix'], ['types', 'Type Charts'], ['coverage', 'Coverage'], ['speed', 'Speed'], ['roles', 'Roles'], ['tests', 'Test Cases'], ['meta', 'Meta']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                className={`text-xs px-3 py-1 rounded transition-colors ${tab === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {/* Format */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500">Format:</span>
          <div className="flex gap-1">
            {FORMAT_OPTIONS.map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  format === f ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}>
                {FORMATS[f].label}
              </button>
            ))}
          </div>
        </div>
        {/* Meta mode */}
        {format === 'reg-ma' && (
          <button
            onClick={() => setMetaMode(m => !m)}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              metaMode ? 'bg-indigo-700 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title="Limit Speed and Coverage to top 30 meta Pokémon">
            Meta Mode
          </button>
        )}
        {/* Weather field icon */}
        <div className="relative"
          onMouseEnter={() => { clearTimeout(weatherTimerRef.current); setWeatherOpen(true); }}
          onMouseLeave={() => { weatherTimerRef.current = setTimeout(() => setWeatherOpen(false), 500); }}>
          <button className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
            weather !== 'none' ? WEATHER_ACTIVE[weather] : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`} title={`Weather: ${WEATHER_LABELS[weather]}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10.5a2.5 2.5 0 0 0-2.5-2.5 2.5 2.5 0 0 0-.18.01A3.5 3.5 0 1 0 3.5 11H13a2 2 0 0 0 0-4 2 2 0 0 0-.09.01A2.5 2.5 0 0 0 13 10.5z" />
            </svg>
          </button>
          {weatherOpen && (
            <div className="absolute right-0 top-full z-50 mt-0.5 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
              style={{ minWidth: 120 }}>
              {WEATHER_OPTIONS.map(w => (
                <button key={w} onClick={() => setWeather(w)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                    weather === w ? WEATHER_ACTIVE[w] : 'text-gray-300 hover:bg-gray-700'
                  }`}>
                  {WEATHER_LABELS[w] === '—' ? 'None' : WEATHER_LABELS[w]}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Shared attacker/defender header — visible in Setup and Damage */}
      {showSharedHeader && (
        <div className="bg-gray-900 border-b border-gray-800 shrink-0 flex">
          {/* Attackers side */}
          <div className="flex-1 flex flex-col border-r border-gray-800 min-w-0">
            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-sm font-semibold text-gray-200">
                Attackers <span className="text-gray-600 font-normal text-xs">({attackers.length}/6)</span>
              </span>
              <div className="flex items-center gap-2">
                <button onClick={swapSides}
                  className="text-xs px-2.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title="Swap attackers and defenders">⇄ Swap</button>
                <button onClick={() => setAtkModal(true)}
                  className="text-xs px-2.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                  Import / Export</button>
              </div>
            </div>
            <div className="flex overflow-x-auto border-t border-gray-800">
              {attackers.filter(a => a.pokemon).map(a => (
                <button key={a.id} onClick={() => { setSelectedAtkId(a.id); setAtkShowAdd(false); }}
                  title={toDisplayName(a.pokemon.name)}
                  className={`flex items-center justify-center px-1.5 pt-1 pb-0.5 shrink-0 border-b-2 transition-colors ${
                    selectedAtk?.id === a.id
                      ? 'border-blue-500 bg-gray-800'
                      : 'border-transparent hover:bg-gray-800/50 opacity-60 hover:opacity-100'
                  }`} style={{ minWidth: 52 }}>
                  <img src={a.pokemon.artwork || a.pokemon.sprite}
                    onError={e => { if (a.pokemon.sprite) e.target.src = a.pokemon.sprite; }}
                    alt="" className="w-10 h-10 object-contain" />
                </button>
              ))}
              {attackers.length < 6 && (
                <button onClick={() => setAtkShowAdd(true)}
                  className={`flex items-center justify-center shrink-0 border-b-2 transition-colors text-xl font-light ${
                    !selectedAtk
                      ? 'border-blue-500 bg-gray-800 text-blue-400'
                      : 'border-transparent text-gray-600 hover:bg-gray-800/50 hover:text-gray-400'
                  }`} style={{ minWidth: 52, height: 50 }}>
                  +
                </button>
              )}
            </div>
          </div>

          {/* Defenders side */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-1">
              <span className="text-sm font-semibold text-gray-200">
                Defenders <span className="text-gray-600 font-normal text-xs">({defenders.length}/6)</span>
              </span>
              <button onClick={() => setDefModal(true)}
                className="text-xs px-2.5 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                Import / Export</button>
            </div>
            <div className="flex overflow-x-auto border-t border-gray-800">
              {defenders.filter(d => d.pokemon).map(d => (
                <button key={d.id} onClick={() => { setSelectedDefId(d.id); setDefShowAdd(false); }}
                  title={toDisplayName(d.pokemon.name)}
                  className={`flex items-center justify-center px-1.5 pt-1 pb-0.5 shrink-0 border-b-2 transition-colors ${
                    selectedDef?.id === d.id
                      ? 'border-orange-500 bg-gray-800'
                      : 'border-transparent hover:bg-gray-800/50 opacity-60 hover:opacity-100'
                  }`} style={{ minWidth: 52 }}>
                  <img src={d.pokemon.artwork || d.pokemon.sprite}
                    onError={e => { if (d.pokemon.sprite) e.target.src = d.pokemon.sprite; }}
                    alt="" className="w-10 h-10 object-contain" />
                </button>
              ))}
              {defenders.length < 6 && (
                <button onClick={() => setDefShowAdd(true)}
                  className={`flex items-center justify-center shrink-0 border-b-2 transition-colors text-xl font-light ${
                    !selectedDef
                      ? 'border-orange-500 bg-gray-800 text-orange-400'
                      : 'border-transparent text-gray-600 hover:bg-gray-800/50 hover:text-gray-400'
                  }`} style={{ minWidth: 52, height: 50 }}>
                  +
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Setup body */}
      {tab === 'setup' && (
        <main className="flex-1 flex overflow-hidden">
          <section className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto p-2">
              {selectedAtk ? (
                <AttackerCard
                  key={selectedAtk.id}
                  attacker={selectedAtk}
                  pokemonData={filteredPokemon}
                  movesData={movesData}
                  weather={weather}
                  onChange={patch => updateAttacker(selectedAtk.id, patch)}
                  onRemove={() => removeAttacker(selectedAtk.id)}
                />
              ) : (
                <PokemonSearch
                  key={atkSearchKey}
                  value={null}
                  onChange={addAttackerWithPokemon}
                  pokemonData={filteredPokemon}
                  placeholder="Add Pokémon"
                />
              )}
            </div>
          </section>
          <section className="flex-1 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto p-2">
              {selectedDef ? (
                <DefenderCard
                  key={selectedDef.id}
                  defender={selectedDef}
                  pokemonData={filteredPokemon}
                  movesData={movesData}
                  attackers={attackers}
                  weather={weather}
                  onChange={patch => updateDefender(selectedDef.id, patch)}
                  onRemove={() => removeDefender(selectedDef.id)}
                  showDamage={false}
                />
              ) : (
                <PokemonSearch
                  key={defSearchKey}
                  value={null}
                  onChange={addDefenderWithPokemon}
                  pokemonData={filteredPokemon}
                  placeholder="Add Pokémon"
                />
              )}
            </div>
          </section>
        </main>
      )}

      {/* Damage body — split screen */}
      {tab === 'damage' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: selected attacker vs each defender */}
          <div className="flex-1 overflow-y-auto p-2 border-r border-gray-800 min-w-0">
            {!selectedAtk ? (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Add an attacker in Setup.
              </div>
            ) : eligibleDef.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Add defenders in Setup.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {eligibleDef.map(def => (
                  <DefenderDamageCard key={def.id} defender={def} attackers={[selectedAtk]} weather={weather} inlineHeader />
                ))}
              </div>
            )}
          </div>

          {/* Right: each attacker vs selected defender */}
          <div className="flex-1 overflow-y-auto p-2 min-w-0">
            {!selectedDef ? (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Add a defender in Setup.
              </div>
            ) : eligibleAtk.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                Add attackers in Setup.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {eligibleAtk.map(atk => (
                  <DefenderDamageCard key={atk.id} defender={selectedDef} attackers={[atk]} weather={weather} inlineHeader />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'matrix' && (
        <MatchupMatrix attackers={attackers} defenders={defenders} weather={weather} />
      )}
      {tab === 'types' && (
        <TypeChartTab attackers={attackers} defenders={defenders} />
      )}
      {tab === 'coverage' && (
        <CoverageTab attackers={attackers} pokemonData={speedCovData} />
      )}
      {tab === 'speed' && (
        <SpeedTab attackers={attackers} defenders={defenders} pokemonData={speedCovData} />
      )}
      {tab === 'roles' && (
        <RolesTab attackers={attackers} defenders={defenders} />
      )}
      {tab === 'tests' && (
        <TestCasesTab attackers={attackers} defenders={defenders} pokemonData={filteredPokemon} />
      )}
      {tab === 'meta' && (
        <MetaTab pokemonData={filteredPokemon} movesData={movesData} onAddDefender={(p, moves = []) => {
          const entry = { ...makeDefender(), pokemon: p, statPoints: { hp: 32, atk: 0, def: 17, spa: 0, spd: 17, spe: 0 }, moves };
          setDefenders(prev => [...prev, entry]);
          setSelectedDefId(entry.id);
        }} />
      )}

      {/* Modals */}
      {atkModal && (
        <ImportExportModal
          team={attackers}
          maxSize={6}
          pokemonData={filteredPokemon}
          movesData={movesData}
          onApply={team => { setAttackers(team); setAtkModal(false); setSelectedAtkId(team.find(a => a.pokemon)?.id ?? null); setAtkShowAdd(false); }}
          onClose={() => setAtkModal(false)}
        />
      )}
      {defModal && (
        <ImportExportModal
          team={defenders}
          maxSize={6}
          pokemonData={filteredPokemon}
          movesData={movesData}
          onApply={team => { setDefenders(team); setDefModal(false); setSelectedDefId(team.find(d => d.pokemon)?.id ?? null); setDefShowAdd(false); }}
          onClose={() => setDefModal(false)}
        />
      )}
    </div>
  );
}
