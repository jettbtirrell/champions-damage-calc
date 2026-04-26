import { NATURES } from './natures';

// Convert display name like "Giga Drain" → PokeAPI name "giga-drain"
export function toApiName(displayName) {
  return displayName
    .toLowerCase()
    .replace(/\s*\(m\)\s*$/i, '-male')
    .replace(/\s*\(f\)\s*$/i, '-female')
    .replace(/['.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

// Convert PokeAPI name "giga-drain" → display "Giga Drain"
export function toDisplayName(apiName) {
  return apiName
    .replace(/-male$/, ' (M)')
    .replace(/-female$/, ' (F)')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const EV_LABEL_TO_KEY = { HP: 'hp', Atk: 'atk', Def: 'def', SpA: 'spa', SpD: 'spd', Spe: 'spe' };
const KEY_TO_EV_LABEL = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };

export function parseSingleSet(text, pokemonData, movesData) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  // Line 0: Name @ Item
  const [namePart, itemPart] = lines[0].split('@');
  const rawName = namePart.trim();
  const apiName = toApiName(rawName);
  const item = itemPart?.trim() || null;

  const pokemon = pokemonData.find(p => p.name === apiName) || null;

  const statPoints = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  let nature = 'hardy';
  let ability = null;
  const moves = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Ability:')) {
      ability = line.slice(8).trim();
    } else if (line.startsWith('EVs:') || line.startsWith('IVs:')) {
      const parts = line.slice(4).split('/');
      for (const part of parts) {
        const m = part.trim().match(/^(\d+)\s+(\S+)$/);
        if (m) {
          const key = EV_LABEL_TO_KEY[m[2]];
          if (key) statPoints[key] = Math.min(32, Math.max(0, parseInt(m[1], 10)));
        }
      }
    } else if (line.endsWith('Nature')) {
      const natureName = line.replace(' Nature', '').toLowerCase();
      if (NATURES[natureName]) nature = natureName;
    } else if (line.startsWith('-')) {
      const moveName = toApiName(line.slice(1).trim());
      const move = movesData.find(m => m.name === moveName);
      if (move) moves.push(move);
    }
  }

  return {
    id: crypto.randomUUID(),
    pokemon,
    nature,
    statPoints,
    moves,
    item,
    ability,
    burned: false,
  };
}

export function parseShowdownTeam(text, pokemonData, movesData) {
  // Split by blank lines between sets
  const blocks = text.trim().split(/\n\s*\n/);
  return blocks
    .map(b => parseSingleSet(b, pokemonData, movesData))
    .filter(Boolean);
}

export function exportSingleSet(mon) {
  const { pokemon, nature, statPoints, moves, item, ability } = mon;
  if (!pokemon) return '';

  const displayName = toDisplayName(pokemon.name);
  const lines = [item ? `${displayName} @ ${item}` : displayName];
  if (ability) lines.push(`Ability: ${ability}`);
  lines.push('Level: 50');

  const evParts = Object.entries(statPoints)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${KEY_TO_EV_LABEL[k]}`);
  if (evParts.length) lines.push(`EVs: ${evParts.join(' / ')}`);

  const natureCap = nature.charAt(0).toUpperCase() + nature.slice(1);
  lines.push(`${natureCap} Nature`);

  for (const move of (moves || [])) {
    lines.push(`- ${toDisplayName(move.name)}`);
  }

  return lines.join('\n');
}

export function exportShowdownTeam(team) {
  return team.map(exportSingleSet).filter(Boolean).join('\n\n');
}
