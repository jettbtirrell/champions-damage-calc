import { toDisplayName } from '../utils/importExport';
import { DefenderDamageCard } from './DamageTab';

export default function DamageTab2({ attackers, defenders, weather, selectedId, setSelectedId, selectedSide, setSelectedSide, setSetupAtkId, setSetupDefId }) {
  const eligibleAtk = attackers.filter(a => a.pokemon);
  const eligibleDef = defenders.filter(d => d.pokemon);

  const hasAny = eligibleAtk.length > 0 || eligibleDef.length > 0;

  // Derive effective selection — fall back to first attacker or first defender
  let effectiveId = selectedId;
  let effectiveSide = selectedSide;
  const resolvedAtk = eligibleAtk.find(a => a.id === selectedId);
  const resolvedDef = eligibleDef.find(d => d.id === selectedId);
  if (!resolvedAtk && !resolvedDef) {
    if (eligibleAtk.length > 0) { effectiveId = eligibleAtk[0].id; effectiveSide = 'atk'; }
    else if (eligibleDef.length > 0) { effectiveId = eligibleDef[0].id; effectiveSide = 'def'; }
  }

  const selected =
    effectiveSide === 'atk' ? eligibleAtk.find(a => a.id === effectiveId) :
    effectiveSide === 'def' ? eligibleDef.find(d => d.id === effectiveId) :
    null;

  function selectAtk(id) { setSelectedId(id); setSelectedSide('atk'); setSetupAtkId(id); }
  function selectDef(id) { setSelectedId(id); setSelectedSide('def'); setSetupDefId(id); }

  if (!hasAny) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Add Pokémon in the Setup tab first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="bg-gray-900 border-b border-gray-800 shrink-0 flex overflow-x-auto">
        {eligibleAtk.map(a => {
          const active = effectiveSide === 'atk' && effectiveId === a.id;
          return (
            <button key={a.id} onClick={() => selectAtk(a.id)}
              title={toDisplayName(a.pokemon.name)}
              className={`flex flex-col items-center justify-end px-2 pt-1.5 pb-1 shrink-0 border-b-2 transition-colors ${
                active ? 'border-blue-500 bg-gray-800' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-gray-800/50'
              }`} style={{ minWidth: 56 }}>
              <img
                src={a.pokemon.artwork || a.pokemon.sprite}
                onError={e => { if (a.pokemon.sprite) e.target.src = a.pokemon.sprite; }}
                alt="" className="w-10 h-10 object-contain"
              />
            </button>
          );
        })}

        {eligibleAtk.length > 0 && eligibleDef.length > 0 && (
          <div className="w-px mx-1 my-2 bg-gray-700 shrink-0" />
        )}

        {eligibleDef.map(d => {
          const active = effectiveSide === 'def' && effectiveId === d.id;
          return (
            <button key={d.id} onClick={() => selectDef(d.id)}
              title={toDisplayName(d.pokemon.name)}
              className={`flex flex-col items-center justify-end px-2 pt-1.5 pb-1 shrink-0 border-b-2 transition-colors ${
                active ? 'border-orange-500 bg-gray-800' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-gray-800/50'
              }`} style={{ minWidth: 56 }}>
              <img
                src={d.pokemon.artwork || d.pokemon.sprite}
                onError={e => { if (d.pokemon.sprite) e.target.src = d.pokemon.sprite; }}
                alt="" className="w-10 h-10 object-contain"
              />
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {selected && effectiveSide === 'atk' && (
          eligibleDef.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Add defenders in the Setup tab.
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {eligibleDef.map(def => (
                <DefenderDamageCard key={def.id} defender={def} attackers={[selected]} weather={weather} />
              ))}
            </div>
          )
        )}

        {selected && effectiveSide === 'def' && (
          eligibleAtk.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Add attackers in the Setup tab.
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {eligibleAtk.map(atk => (
                <DefenderDamageCard key={atk.id} defender={selected} attackers={[atk]} weather={weather} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
