import { useMemo } from 'react';
import { getTypeEffectiveness, TYPE_COLORS } from '../data/typeChart';
import { toDisplayName } from '../utils/importExport';

const ALL_TYPES = [
  'normal','fire','water','grass','electric','ice',
  'fighting','poison','ground','flying','psychic','bug',
  'rock','ghost','dragon','dark','steel','fairy',
];

const TYPE_ABBR = {
  normal:'Nor', fire:'Fire', water:'Wat', grass:'Grs', electric:'Elc', ice:'Ice',
  fighting:'Fgt', poison:'Psn', ground:'Gnd', flying:'Fly', psychic:'Psy', bug:'Bug',
  rock:'Rock', ghost:'Gst', dragon:'Drg', dark:'Drk', steel:'Stl', fairy:'Fry',
};

const MULT_STYLE = {
  0:    { label: '0×',  bg: 'var(--acc-zero-bg)',    text: 'var(--acc-zero-text)'    },
  0.25: { label: '¼×',  bg: 'var(--acc-dkblue-bg)', text: 'var(--acc-dkblue-text)'  },
  0.5:  { label: '½×',  bg: 'var(--acc-blue-bg)',    text: 'var(--acc-blue-text)'    },
  1:    { label: null,  bg: null,                    text: null                       },
  2:    { label: '2×',  bg: 'var(--acc-orange-bg)',  text: 'var(--acc-orange-text)'  },
  4:    { label: '4×',  bg: 'var(--acc-red-bg)',     text: 'var(--acc-red-text)'     },
};

function TypeGrid({ team, label }) {
  const rows = useMemo(() =>
    team
      .filter(m => m.pokemon)
      .map(m => ({
        id: m.id,
        pokemon: m.pokemon,
        cells: ALL_TYPES.map(t => {
          const mult = getTypeEffectiveness(t, m.pokemon.types);
          return { type: t, mult };
        }),
      })),
    [team]
  );

  const colTints = useMemo(() => {
    if (rows.length === 0) return {};
    const tints = {};
    for (const t of ALL_TYPES) {
      const mults = rows.map(row => row.cells.find(c => c.type === t).mult);
      const allAtMost1 = mults.every(m => m <= 1) && mults.some(m => m < 1);
      const allAtLeast1 = mults.every(m => m >= 1) && mults.some(m => m > 1);
      if (allAtMost1) tints[t] = 'blue';
      else if (allAtLeast1) tints[t] = 'red';
    }
    return tints;
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">{label}</h2>
        <p className="text-gray-600 text-xs italic">No Pokémon selected.</p>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-gray-300 mb-2">{label} <span className="text-gray-600 font-normal">({rows.length})</span></h2>
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="border-collapse text-xs w-full" style={{ minWidth: 720, tableLayout: 'fixed' }}>
          <thead>
            <tr className="bg-gray-900">
              {/* Pokemon name column */}
              <th className="sticky left-0 z-10 bg-gray-900 text-left px-3 py-2 text-gray-500 font-medium border-r border-gray-800 whitespace-nowrap" style={{ width: 130 }}>
                Pokémon
              </th>
              {ALL_TYPES.map(t => {
                const tint = colTints[t];
                return (
                  <th key={t} className="py-2 px-0.5 font-medium text-center" style={{
                    width: 36,
                    backgroundColor: tint === 'red' ? 'rgba(180,30,30,0.18)' : tint === 'blue' ? 'rgba(30,80,200,0.18)' : undefined,
                  }}>
                    <div
                      className="rounded px-1 py-0.5 mx-auto text-white font-medium"
                      style={{ backgroundColor: TYPE_COLORS[t], fontSize: 9, width: 'fit-content' }}
                    >
                      {TYPE_ABBR[t]}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id} className={i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}>
                <td className={`sticky left-0 z-10 border-r border-gray-800 px-2 py-1.5 whitespace-nowrap ${i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}`}>
                  <div className="flex items-center gap-1.5">
                    {(row.pokemon.artwork || row.pokemon.sprite) && (
                      <img
                        src={row.pokemon.artwork || row.pokemon.sprite}
                        onError={e => { if (row.pokemon.sprite) e.target.src = row.pokemon.sprite; }}
                        alt="" className="w-7 h-7 object-contain shrink-0"
                      />
                    )}
                    <div>
                      <div className="text-gray-200 font-medium leading-tight">{toDisplayName(row.pokemon.name)}</div>
                      <div className="flex gap-0.5 mt-0.5">
                        {row.pokemon.types.map(t => (
                          <span key={t} className="rounded text-white px-1"
                            style={{ backgroundColor: TYPE_COLORS[t], fontSize: 8 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                {row.cells.map(({ type, mult }) => {
                  const style = MULT_STYLE[mult] ?? MULT_STYLE[1];
                  const tint = colTints[type];
                  return (
                    <td key={type} className="p-0.5 text-center" style={{
                      backgroundColor: tint === 'red' ? 'rgba(200,30,30,0.10)' : tint === 'blue' ? 'rgba(30,80,200,0.10)' : undefined,
                    }}>
                      {style.label ? (
                        <div
                          className="rounded font-bold mx-auto flex items-center justify-center"
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                            fontSize: 10,
                            height: 22,
                            width: 28,
                          }}
                        >
                          {style.label}
                        </div>
                      ) : (
                        <div className="h-[22px]" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TypeChartTab({ attackers, defenders }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
<TypeGrid team={attackers} label="Attackers" />
      <TypeGrid team={defenders} label="Defenders" />
    </div>
  );
}
