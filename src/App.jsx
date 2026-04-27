import { useState, useMemo } from 'react';
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
    boosts: { atk: 0, spa: 0 },
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
  const [atkModal, setAtkModal] = useState(false);
  const [defModal, setDefModal] = useState(false);
  const [tab, setTab] = useState('calc');
  const [atkSearchKey, setAtkSearchKey] = useState(0);
  const [defSearchKey, setDefSearchKey] = useState(0);

  const filteredPokemon = useMemo(
    () => pokemonData.filter(FORMATS[format].filter),
    [format]
  );

  function updateAttacker(id, patch) {
    setAttackers(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }
  function removeAttacker(id) { setAttackers(prev => prev.filter(a => a.id !== id)); }
  function addAttackerWithPokemon(p) {
    if (attackers.length >= 20) return;
    setAttackers(prev => [{ ...makeAttacker(), pokemon: p }, ...prev]);
    setAtkSearchKey(k => k + 1);
  }

  function updateDefender(id, patch) {
    setDefenders(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  }
  function removeDefender(id) { setDefenders(prev => prev.filter(d => d.id !== id)); }
  function addDefenderWithPokemon(p) {
    setDefenders(prev => [{ ...makeDefender(), pokemon: p }, ...prev]);
    setDefSearchKey(k => k + 1);
  }

  function swapSides() {
    setAttackers(defenders);
    setDefenders(attackers);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">Pokémin-max</span>
          <div className="flex gap-1">
            {[['calc', 'Calculator'], ['types', 'Type Charts'], ['coverage', 'Coverage'], ['speed', 'Speed'], ['roles', 'Roles'], ['tests', 'Test Cases'], ['meta', 'Meta']].map(([key, label]) => (
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
      </header>

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
        <MetaTab pokemonData={filteredPokemon} onAddDefender={p => { setDefenders(prev => [{ ...makeDefender(), pokemon: p }, ...prev]); setTab('calc'); }} />
      )}

      {/* Main panels */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 57px)', display: tab === 'calc' ? undefined : 'none' }}>
        {/* Attackers panel */}
        <section className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden min-w-0">
          <div className="bg-gray-900 border-b border-gray-800 shrink-0">
            <div className="flex items-center justify-between px-4 py-2 ">
              <span className="text-sm font-semibold text-gray-200">
                Attackers <span className="text-gray-600 font-normal text-xs">({attackers.length}/20)</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={swapSides}
                  className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  title="Swap attackers and defenders"
                >
                  ⇄ Swap
                </button>
                <button
                  onClick={() => setAtkModal(true)}
                  className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  Import / Export
                </button>
              </div>
            </div>
            <div className="px-3 pb-2">
              <PokemonSearch
                key={atkSearchKey}
                value={null}
                onChange={addAttackerWithPokemon}
                pokemonData={filteredPokemon}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {attackers.map((a, i) => (
              <AttackerCard
                key={a.id}
                attacker={a}
                index={i}
                pokemonData={filteredPokemon}
                movesData={movesData}
                weather={weather}
                onChange={patch => updateAttacker(a.id, patch)}
                onRemove={() => removeAttacker(a.id)}
              />
            ))}
          </div>
        </section>

        {/* Defenders panel */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="bg-gray-900 border-b border-gray-800 shrink-0">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm font-semibold text-gray-200">
                Defenders <span className="text-gray-600 font-normal text-xs">({defenders.length})</span>
              </span>
              <button
                onClick={() => setDefModal(true)}
                className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                Import / Export
              </button>
            </div>
            <div className="px-3 pb-2">
              <PokemonSearch
                key={defSearchKey}
                value={null}
                onChange={addDefenderWithPokemon}
                pokemonData={filteredPokemon}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {defenders.map(d => (
              <DefenderCard
                key={d.id}
                defender={d}
                pokemonData={filteredPokemon}
                attackers={attackers}
                weather={weather}
                onChange={patch => updateDefender(d.id, patch)}
                onRemove={() => removeDefender(d.id)}
              />
            ))}
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
