import { useState, useMemo, useRef, useEffect } from 'react';
import { toDisplayName } from '../utils/importExport';
import { TYPE_COLORS } from '../data/typeChart';

export default function PokemonSearch({ value, onChange, pokemonData, placeholder = 'Search Pokémon…', inputRef: externalInputRef }) {
  const [query, setQuery] = useState(value ? toDisplayName(value.name) : '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const internalInputRef = useRef(null);
  const inputRef = externalInputRef || internalInputRef;

  useEffect(() => {
    if (value) setQuery(toDisplayName(value.name));
    else setQuery('');
  }, [value]);

  useEffect(() => {
    function onOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return pokemonData.slice(0, 30);
    const q = query.toLowerCase();
    return pokemonData.filter(p => p.name.includes(q) || toDisplayName(p.name).toLowerCase().includes(q)).slice(0, 30);
  }, [query, pokemonData]);

  function select(p) {
    onChange(p);
    setQuery(toDisplayName(p.name));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative w-full">
      <input
        ref={inputRef}
        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        placeholder={placeholder}
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Enter' && filtered.length > 0) select(filtered[0]); }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-xl max-h-52 overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-700 transition-colors"
              onMouseDown={() => select(p)}
            >
              <img
                src={p.artwork || p.sprite}
                onError={e => { if (p.sprite) e.target.src = p.sprite; }}
                alt="" className="w-10 h-10 object-contain"
              />
              <span className="text-gray-100 flex-1">{toDisplayName(p.name)}</span>
              <span className="flex gap-1">
                {p.types.map(t => (
                  <span key={t} className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
                    style={{ backgroundColor: TYPE_COLORS[t] || 'var(--type-fallback)', fontSize: 10 }}>
                    {t}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
