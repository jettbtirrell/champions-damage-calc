import { useState, useMemo } from 'react';
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
import DamageTab from './components/DamageTab';
import { FORMATS, FORMAT_OPTIONS } from './data/formats';

const WEATHER_OPTIONS = ['none', 'sun', 'rain', 'sand', 'snow'];
const WEATHER_LABELS  = { none: '—', sun: 'Sun', rain: 'Rain', sand: 'Sand', snow: 'Snow' };
const WEATHER_ACTIVE  = {
  none: 'bg-gray-600 text-white',
  sun:  'bg-orange-600 text-white',
  rain: 'bg-blue-600 text-white',
  sand: 'bg-yellow-700 text-white',
  snow: 'bg-cyan-700 text-white',
};

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
  const [theme, setTheme] = useState('dark');
  const [atkModal, setAtkModal] = useState(false);
  const [defModal, setDefModal] = useState(false);
  const [tab, setTab] = useState('setup');
  const [atkSearchKey, setAtkSearchKey] = useState(0);
  const [defSearchKey, setDefSearchKey] = useState(0);
  const [selectedAtkId, setSelectedAtkId] = useState(null);
  const [selectedDefId, setSelectedDefId] = useState(null);
  const [dmgDeselAtk, setDmgDeselAtk] = useState(new Set());
  const [dmgDeselDef, setDmgDeselDef] = useState(new Set());

  const filteredPokemon = useMemo(
    () => pokemonData.filter(FORMATS[format].filter),
    [format]
  );

  const selectedAtk = selectedAtkId ? (attackers.find(a => a.id === selectedAtkId) ?? null) : null;
  const selectedDef = selectedDefId ? (defenders.find(d => d.id === selectedDefId) ?? null) : null;

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
    if (attackers.length >= 20) return;
    const entry = { ...makeAttacker(), pokemon: p };
    setAttackers(prev => [...prev, entry]);
    setSelectedAtkId(entry.id);
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
    const entry = { ...makeDefender(), pokemon: p };
    setDefenders(prev => [...prev, entry]);
    setSelectedDefId(entry.id);
    setDefSearchKey(k => k + 1);
  }

  function swapSides() {
    setAttackers(defenders);
    setDefenders(attackers);
    setSelectedAtkId(selectedDefId);
    setSelectedDefId(selectedAtkId);
  }

  return (
    <div className={`min-h-screen bg-gray-950 flex flex-col${theme === 'light' ? ' light' : ''}`}>
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
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  format === f ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {FORMATS[f].label}
              </button>
            ))}
          </div>
        </div>
        {/* Weather */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Weather:</span>
          <div className="flex gap-1">
            {WEATHER_OPTIONS.map(w => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  weather === w
                    ? WEATHER_ACTIVE[w]
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {WEATHER_LABELS[w]}
              </button>
            ))}
          </div>
        </div>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          className="text-xs px-2.5 py-1 rounded bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200 transition-colors"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </header>

      {tab === 'matrix' && (
        <MatchupMatrix attackers={attackers} defenders={defenders} weather={weather} />
      )}
      {tab === 'damage' && (
        <DamageTab
          attackers={attackers} defenders={defenders} weather={weather}
          deselAtk={dmgDeselAtk} setDeselAtk={setDmgDeselAtk}
          deselDef={dmgDeselDef} setDeselDef={setDmgDeselDef}
        />
      )}
      {tab === 'types' && (
        <TypeChartTab attackers={attackers} defenders={defenders} />
      )}
      {tab === 'coverage' && (
        <CoverageTab attackers={attackers} pokemonData={filteredPokemon} />
      )}
      {tab === 'speed' && (
        <SpeedTab attackers={attackers} defenders={defenders} pokemonData={filteredPokemon} />
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

      {/* Main panels */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 57px)', display: (tab === 'setup') ? undefined : 'none' }}>
        {/* Attackers panel */}
        <section className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden min-w-0">
          <div className="bg-gray-900 border-b border-gray-800 shrink-0">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-semibold text-gray-200">
                Attackers <span className="text-gray-600 font-normal text-xs">({attackers.length}/20)</span>
              </span>
              <div className="flex items-center gap-2">
                <button onClick={swapSides}
                  className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title="Swap attackers and defenders">⇄ Swap</button>
                <button onClick={() => setAtkModal(true)}
                  className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                  Import / Export</button>
              </div>
            </div>
            <div className="flex overflow-x-auto border-t border-gray-800">
              {attackers.filter(a => a.pokemon).map(a => (
                <button key={a.id} onClick={() => setSelectedAtkId(a.id)}
                  title={toDisplayName(a.pokemon.name)}
                  className={`flex items-center justify-center px-2 pt-1.5 pb-1 shrink-0 border-b-2 transition-colors ${
                    selectedAtk?.id === a.id
                      ? 'border-blue-500 bg-gray-800'
                      : 'border-transparent hover:bg-gray-800/50 opacity-60 hover:opacity-100'
                  }`} style={{ minWidth: 56 }}>
                  <img src={a.pokemon.artwork || a.pokemon.sprite}
                    onError={e => { if (a.pokemon.sprite) e.target.src = a.pokemon.sprite; }}
                    alt="" className="w-10 h-10 object-contain" />
                </button>
              ))}
              {attackers.length < 20 && (
                <button onClick={() => setSelectedAtkId(null)}
                  className={`flex items-center justify-center shrink-0 border-b-2 transition-colors text-xl font-light ${
                    !selectedAtk
                      ? 'border-blue-500 bg-gray-800 text-blue-400'
                      : 'border-transparent text-gray-600 hover:bg-gray-800/50 hover:text-gray-400'
                  }`} style={{ minWidth: 56, height: 54 }}>
                  +
                </button>
              )}
            </div>
          </div>
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

        {/* Defenders panel */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="bg-gray-900 border-b border-gray-800 shrink-0">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-semibold text-gray-200">
                Defenders <span className="text-gray-600 font-normal text-xs">({defenders.length})</span>
              </span>
              <button onClick={() => setDefModal(true)}
                className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                Import / Export</button>
            </div>
            <div className="flex overflow-x-auto border-t border-gray-800">
              {defenders.filter(d => d.pokemon).map(d => (
                <button key={d.id} onClick={() => setSelectedDefId(d.id)}
                  title={toDisplayName(d.pokemon.name)}
                  className={`flex items-center justify-center px-2 pt-1.5 pb-1 shrink-0 border-b-2 transition-colors ${
                    selectedDef?.id === d.id
                      ? 'border-orange-500 bg-gray-800'
                      : 'border-transparent hover:bg-gray-800/50 opacity-60 hover:opacity-100'
                  }`} style={{ minWidth: 56 }}>
                  <img src={d.pokemon.artwork || d.pokemon.sprite}
                    onError={e => { if (d.pokemon.sprite) e.target.src = d.pokemon.sprite; }}
                    alt="" className="w-10 h-10 object-contain" />
                </button>
              ))}
              <button onClick={() => setSelectedDefId(null)}
                className={`flex items-center justify-center shrink-0 border-b-2 transition-colors text-xl font-light ${
                  !selectedDef
                    ? 'border-orange-500 bg-gray-800 text-orange-400'
                    : 'border-transparent text-gray-600 hover:bg-gray-800/50 hover:text-gray-400'
                }`} style={{ minWidth: 56, height: 54 }}>
                +
              </button>
            </div>
          </div>
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

      {/* Modals */}
      {atkModal && (
        <ImportExportModal
          team={attackers}
          maxSize={20}
          pokemonData={filteredPokemon}
          movesData={movesData}
          onApply={team => { setAttackers(team); setAtkModal(false); }}
          onClose={() => setAtkModal(false)}
        />
      )}
      {defModal && (
        <ImportExportModal
          team={defenders}
          pokemonData={filteredPokemon}
          movesData={movesData}
          onApply={team => { setDefenders(team); setDefModal(false); }}
          onClose={() => setDefModal(false)}
        />
      )}
    </div>
  );
}
