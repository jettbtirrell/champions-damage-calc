import { useState, useEffect } from 'react';
import { parseShowdownTeam, exportShowdownTeam } from '../utils/importExport';

async function loadSaved() {
  try {
    const res = await fetch('/api/teams');
    if (res.ok) return await res.json();
  } catch {}
  try { return JSON.parse(localStorage.getItem('pokemin-saved-teams')) ?? []; }
  catch { return []; }
}

async function persistSaved(teams) {
  try {
    const res = await fetch('/api/teams', { method: 'POST', body: JSON.stringify(teams) });
    if (res.ok) return;
  } catch {}
  localStorage.setItem('pokemin-saved-teams', JSON.stringify(teams));
}

export default function ImportExportModal({ team, onApply, onClose, pokemonData, movesData, maxSize }) {
  const [text, setText] = useState(() => exportShowdownTeam(team));
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedTeams, setSavedTeams] = useState([]);

  useEffect(() => { loadSaved().then(setSavedTeams); }, []);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setText(exportShowdownTeam(team)); }, [team]);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function apply() {
    try {
      const parsed = parseShowdownTeam(text, pokemonData, movesData);
      if (maxSize && parsed.length > maxSize) { setError(`Max ${maxSize} Pokémon per panel.`); return; }
      setError('');
      onApply(parsed);
    } catch (e) {
      setError(`Parse error: ${e.message}`);
    }
  }

  function saveTeam() {
    const name = saveName.trim();
    if (!name) return;
    const entry = { id: crypto.randomUUID(), name, text };
    const updated = [entry, ...savedTeams];
    setSavedTeams(updated);
    persistSaved(updated);
    setSaveName('');
    setSaving(false);
  }

  function deleteTeam(id) {
    const updated = savedTeams.filter(t => t.id !== id);
    setSavedTeams(updated);
    persistSaved(updated);
  }

  function loadTeam(t) {
    setText(t.text);
    setError('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl p-5 w-full max-w-lg mx-4 shadow-2xl flex flex-col gap-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-100">Import / Export</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        {/* Saved teams dropdown */}
        {savedTeams.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs text-gray-500">Saved teams</span>
            <div className="max-h-36 overflow-y-auto space-y-1">
              {savedTeams.map(t => (
                <div key={t.id} className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1">
                  <button
                    onClick={() => loadTeam(t)}
                    className="flex-1 text-left text-sm text-gray-200 hover:text-white transition-colors truncate"
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => deleteTeam(t.id)}
                    className="text-gray-600 hover:text-red-400 text-sm leading-none shrink-0 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Text area */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Showdown format — edit then click Apply</p>
          <textarea
            className="w-full h-56 bg-gray-800 border border-gray-600 rounded p-3 text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-blue-500"
            value={text}
            onChange={e => { setText(e.target.value); setError(''); }}
            spellCheck={false}
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>

        {/* Save team inline form */}
        {saving ? (
          <div className="flex gap-2">
            <input
              autoFocus
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Team name…"
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTeam(); if (e.key === 'Escape') setSaving(false); }}
            />
            <button onClick={saveTeam}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm text-white transition-colors">
              Save
            </button>
            <button onClick={() => setSaving(false)}
              className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <button onClick={copyToClipboard}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={() => { setText(''); setError(''); }}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-red-800 text-sm text-gray-200 transition-colors">
                Clear
              </button>
              <button onClick={() => { setSaving(true); setSaveName(''); }}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-green-800 text-sm text-gray-200 transition-colors">
                Save Team
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={apply}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm text-white font-medium transition-colors">
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
