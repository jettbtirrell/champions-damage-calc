import { useState, useEffect, useRef } from 'react';
import { parseShowdownTeam, exportShowdownTeam } from '../utils/importExport';

export default function ImportExportModal({ team, onApply, onClose, pokemonData, movesData, maxSize }) {
  const [text, setText] = useState(() => exportShowdownTeam(team));
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  useEffect(() => {
    setText(exportShowdownTeam(team));
  }, [team]);

  function apply() {
    try {
      const parsed = parseShowdownTeam(text, pokemonData, movesData);
      if (maxSize && parsed.length > maxSize) {
        setError(`Max ${maxSize} Pokémon per panel.`);
        return;
      }
      setError('');
      onApply(parsed);
    } catch (e) {
      setError(`Parse error: ${e.message}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-lg mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-100">Import / Export</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 text-xl leading-none">×</button>
        </div>
        <p className="text-xs text-gray-500 mb-2">Showdown format — edit then click Apply</p>
        <textarea
          className="w-full h-64 bg-gray-800 border border-gray-600 rounded p-3 text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-blue-500"
          value={text}
          onChange={e => { setText(e.target.value); setError(''); }}
          spellCheck={false}
        />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        <div className="flex gap-2 mt-3 justify-between">
          <button onClick={copyToClipboard}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => { setText(''); setError(''); }}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-red-800 text-sm text-gray-200 transition-colors">
            Clear
          </button>
          <div className="flex gap-2">
          <button onClick={onClose}
            className="px-4 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={apply}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors">
            Apply
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
