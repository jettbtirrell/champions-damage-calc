// Fetches ~100 replays from Pokemon Showdown for gen9championsvgc2026regma,
// parses team usage, move usage, items, and abilities, outputs src/data/meta.json

import { writeFileSync } from 'fs';

const FORMAT = 'gen9championsvgc2026regma';
const REPLAY_API = 'https://replay.pokemonshowdown.com';
const PAGES = 6; // 50 replays per page

// Showdown uses bare name for the default gender form; PokeAPI uses -male/-female
const SHOWDOWN_NAME_MAP = {
  'basculegion':   'basculegion-male',
  'basculegion-f': 'basculegion-female',
  'meowstic':      'meowstic-male',
  'meowstic-f':    'meowstic-female',
  'indeedee':      'indeedee-male',
  'indeedee-f':    'indeedee-female',
  'oinkologne':    'oinkologne-male',
  'oinkologne-f':  'oinkologne-female',
};

function toApiName(name) {
  const base = name.toLowerCase().replace(/['.]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return SHOWDOWN_NAME_MAP[base] ?? base;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseLog(log) {
  const lines = log.split('\n');
  const teams = { p1: [], p2: [] };
  const movesByMon = {};
  const itemsByMon = {};
  const abilitiesByMon = {};
  const onField = {};

  for (const line of lines) {
    const parts = line.split('|');
    if (parts.length < 2) continue;
    const cmd = parts[1];

    if (cmd === 'poke') {
      // |poke|p1|Sneasler, L50, F|
      const player = parts[2];
      const species = toApiName(parts[3]?.split(',')[0]?.trim() || '');
      if (!species) continue;
      if (!teams[player]) teams[player] = [];
      teams[player].push(species);
      const key = `${player}|${species}`;
      movesByMon[key] = new Set();
      itemsByMon[key] = null;
      abilitiesByMon[key] = null;

    } else if (cmd === 'switch' || cmd === 'drag') {
      // |switch|p1a: Sneasler|Sneasler, L50|...
      const slotStr = parts[2] || '';
      const slot = slotStr.split(':')[0].trim();
      const player = slot.slice(0, 2);
      const species = toApiName(parts[3]?.split(',')[0]?.trim() || '');
      if (species) onField[slot] = `${player}|${species}`;

    } else if (cmd === 'move') {
      // |move|p1a: Sneasler|Close Combat|p2a: Incineroar
      const slot = (parts[2] || '').split(':')[0].trim();
      const moveName = toApiName(parts[3] || '');
      const monKey = onField[slot];
      if (monKey && moveName && movesByMon[monKey]) movesByMon[monKey].add(moveName);

    } else if (cmd === '-item' || cmd === '-enditem') {
      // |-item|p1a: Sneasler|White Herb|...
      const slot = (parts[2] || '').split(':')[0].trim();
      const itemName = toApiName(parts[3] || '');
      const monKey = onField[slot];
      if (monKey && itemName && itemsByMon[monKey] === null) itemsByMon[monKey] = itemName;

    } else if (cmd === '-ability') {
      // |-ability|p1a: Sneasler|Unburden|...
      const slot = (parts[2] || '').split(':')[0].trim();
      const abilityName = toApiName(parts[3] || '');
      const monKey = onField[slot];
      if (monKey && abilityName && abilitiesByMon[monKey] === null) abilitiesByMon[monKey] = abilityName;
    }
  }

  return { teams, movesByMon, itemsByMon, abilitiesByMon };
}

function normalizeFreq(counts, teamCount) {
  return Object.fromEntries(
    Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v]) => [k, Math.round(v / teamCount * 1000) / 10])
  );
}

async function main() {
  console.log(`Fetching replay IDs for ${FORMAT}...`);
  const ids = [];
  for (let page = 1; page <= PAGES; page++) {
    const res = await fetch(`${REPLAY_API}/search.json?format=${FORMAT}&page=${page}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    ids.push(...data.map(r => r.id));
    console.log(`  Page ${page}: ${data.length} replays`);
    await sleep(300);
  }
  console.log(`Total replays to process: ${ids.length}\n`);

  const usageCounts = {};
  const moveCounts = {};
  const itemCounts = {};
  const abilityCounts = {};
  const teamCounts = {};
  let totalTeams = 0;
  let failed = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const res = await fetch(`${REPLAY_API}/${id}.log`);
      if (!res.ok) { failed++; continue; }
      const log = await res.text();
      const { teams, movesByMon, itemsByMon, abilitiesByMon } = parseLog(log);

      for (const player of ['p1', 'p2']) {
        const team = teams[player] || [];
        if (team.length === 0) continue;
        totalTeams++;

        for (const species of team) {
          usageCounts[species] = (usageCounts[species] || 0) + 1;
          teamCounts[species] = (teamCounts[species] || 0) + 1;

          const monKey = `${player}|${species}`;

          if (movesByMon[monKey]) {
            if (!moveCounts[species]) moveCounts[species] = {};
            for (const move of movesByMon[monKey]) {
              moveCounts[species][move] = (moveCounts[species][move] || 0) + 1;
            }
          }

          const item = itemsByMon[monKey];
          if (item) {
            if (!itemCounts[species]) itemCounts[species] = {};
            itemCounts[species][item] = (itemCounts[species][item] || 0) + 1;
          }

          const ability = abilitiesByMon[monKey];
          if (ability) {
            if (!abilityCounts[species]) abilityCounts[species] = {};
            abilityCounts[species][ability] = (abilityCounts[species][ability] || 0) + 1;
          }
        }
      }

      if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/${ids.length} processed\r`);
      await sleep(80);
    } catch (e) {
      failed++;
      console.warn(`\n  Failed ${id}: ${e.message}`);
    }
  }

  console.log(`\n\nDone. ${totalTeams} teams from ${ids.length - failed} replays (${failed} failed).`);

  const meta = {};
  for (const [species, count] of Object.entries(usageCounts)) {
    meta[species] = {
      usage: Math.round(count / totalTeams * 1000) / 10,
      moves: normalizeFreq(moveCounts[species] || {}, count),
      items: normalizeFreq(itemCounts[species] || {}, count),
      abilities: normalizeFreq(abilityCounts[species] || {}, count),
    };
  }

  const sorted = Object.fromEntries(
    Object.entries(meta).sort(([, a], [, b]) => b.usage - a.usage)
  );

  writeFileSync('src/data/meta.json', JSON.stringify(sorted, null, 2));

  console.log(`\nTop 15 Pokemon:`);
  Object.entries(sorted).slice(0, 15).forEach(([k, v], i) => {
    console.log(`  ${i + 1}. ${k}: ${v.usage}%`);
  });
  console.log(`\nWrote src/data/meta.json (${Object.keys(sorted).length} Pokemon)`);
}

main().catch(console.error);
