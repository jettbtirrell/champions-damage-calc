import { useState, useMemo, useRef, useEffect } from 'react';
import { toDisplayName } from '../utils/importExport';
import { TYPE_COLORS } from '../data/typeChart';
import { CAT_COLORS } from '../data/theme';

export default function MoveSearch({ onAdd, movesData, existingMoves }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const existingIds = useMemo(() => new Set(existingMoves.map(m => m.id)), [existingMoves]);

  useEffect(() => {
    function onOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return movesData.slice(0, 20);
    const q = query.toLowerCase();
    return movesData
      .filter(m => (m.name.includes(q) || toDisplayName(m.name).toLowerCase().includes(q)) && !existingIds.has(m.id))
      .slice(0, 20);
  }, [query, movesData, existingIds]);

  function add(move) {
    onAdd(move);
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <input
        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        placeholder="Add move…"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl max-h-52 overflow-y-auto">
          {filtered.map(m => (
            <button
              key={m.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-700 transition-colors"
              onMouseDown={() => add(m)}
            >
              <span className="flex-1 text-gray-100">{toDisplayName(m.name)}</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                style={{ backgroundColor: TYPE_COLORS[m.type] || '#888', fontSize: 10 }}>
                {m.type}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                style={{ backgroundColor: CAT_COLORS[m.category] || '#888', fontSize: 10 }}>
                {m.category}
              </span>
              <span className="text-gray-400 text-xs w-8 text-right">{m.power || '—'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
