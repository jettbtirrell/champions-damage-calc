import { useState } from 'react';
import pokemonData from './data/pokemon.json';
import movesData from './data/moves.json';
import AttackerCard from './components/AttackerCard';
import DefenderCard from './components/DefenderCard';
import ImportExportModal from './components/ImportExportModal';

const WEATHER_OPTIONS = ['none', 'sun', 'rain', 'sand', 'snow'];

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
  };
}

function makeDefender() {
  return {
    id: crypto.randomUUID(),
    pokemon: null,
    nature: 'hardy',
    statPoints: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
  };
}

export default function App() {
  const [attackers, setAttackers] = useState([makeAttacker()]);
  const [defenders, setDefenders] = useState([makeDefender()]);
  const [weather, setWeather] = useState('none');
  const [atkModal, setAtkModal] = useState(false);
  const [defModal, setDefModal] = useState(false);

  function updateAttacker(id, patch) {
    setAttackers(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }
  function removeAttacker(id) { setAttackers(prev => prev.filter(a => a.id !== id)); }
  function addAttacker() { if (attackers.length < 20) setAttackers(prev => [...prev, makeAttacker()]); }

  function updateDefender(id, patch) {
    setDefenders(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  }
  function removeDefender(id) { setDefenders(prev => prev.filter(d => d.id !== id)); }
  function addDefender() { setDefenders(prev => [...prev, makeDefender()]); }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-white">⚔ Champions Damage Calc</span>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">Phase 1</span>
        </div>
        {/* Weather (stubbed phase 2) */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-600">Weather (phase 2):</span>
          <div className="flex gap-1">
            {WEATHER_OPTIONS.map(w => (
              <button
                key={w}
                disabled
                className="px-2 py-0.5 rounded text-xs font-medium cursor-not-allowed opacity-30 bg-gray-700 text-gray-400"
              >
                {w === 'none' ? '—' : w.charAt(0).toUpperCase() + w.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main panels */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
        {/* Attackers panel */}
        <section className="flex-1 flex flex-col border-r border-gray-800 overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
            <span className="text-sm font-semibold text-gray-200">
              Attackers <span className="text-gray-600 font-normal text-xs">({attackers.length}/20)</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setAtkModal(true)}
                className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                Import / Export
              </button>
              <button
                onClick={addAttacker}
                disabled={attackers.length >= 20}
                className="text-xs px-2.5 py-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                + Add
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {attackers.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-8">No attackers. Add one to get started.</p>
            )}
            {attackers.map((a, i) => (
              <AttackerCard
                key={a.id}
                attacker={a}
                index={i}
                pokemonData={pokemonData}
                movesData={movesData}
                onChange={patch => updateAttacker(a.id, patch)}
                onRemove={() => removeAttacker(a.id)}
              />
            ))}
          </div>
        </section>

        {/* Defenders panel */}
        <section className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
            <span className="text-sm font-semibold text-gray-200">
              Defenders <span className="text-gray-600 font-normal text-xs">({defenders.length})</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setDefModal(true)}
                className="text-xs px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                Import / Export
              </button>
              <button
                onClick={addDefender}
                className="text-xs px-2.5 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
              >
                + Add
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {defenders.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-8">No defenders. Add one to see damage.</p>
            )}
            {defenders.map(d => (
              <DefenderCard
                key={d.id}
                defender={d}
                pokemonData={pokemonData}
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
          pokemonData={pokemonData}
          movesData={movesData}
          onApply={team => { setAttackers(team); setAtkModal(false); }}
          onClose={() => setAtkModal(false)}
        />
      )}
      {defModal && (
        <ImportExportModal
          team={defenders}
          pokemonData={pokemonData}
          movesData={movesData}
          onApply={team => { setDefenders(team); setDefModal(false); }}
          onClose={() => setDefModal(false)}
        />
      )}
    </div>
  );
}
