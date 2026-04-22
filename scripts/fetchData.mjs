import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://pokeapi.co/api/v2';
const CONCURRENCY = 12;
const BATCH_DELAY = 150;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJson(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) { await sleep(2500 * (i + 1)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(800 * (i + 1));
    }
  }
}

async function fetchBatch(items, fn, concurrency, delay, label) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const settled = await Promise.allSettled(batch.map(fn));
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
      else if (r.status === 'rejected') process.stderr.write(`\nWarn: ${r.reason?.message}\n`);
    }
    if (i + concurrency < items.length) await sleep(delay);
    const done = Math.min(i + concurrency, items.length);
    process.stdout.write(`\r  ${label}: ${done}/${items.length} (${Math.round(done / items.length * 100)}%)`);
  }
  process.stdout.write('\n');
  return results;
}

const STAT_MAP = { hp: 'hp', attack: 'atk', defense: 'def', 'special-attack': 'spa', 'special-defense': 'spd', speed: 'spe' };

async function main() {
  const dataDir = path.join(__dirname, '../src/data');
  fs.mkdirSync(dataDir, { recursive: true });

  // Pokemon
  console.log('Fetching Pokemon list...');
  const pokemonList = await fetchJson(`${BASE}/pokemon?limit=1010&offset=0`);
  console.log(`Got ${pokemonList.results.length} Pokemon. Fetching details...`);
  const pokemonDetails = await fetchBatch(
    pokemonList.results.map(p => p.url),
    fetchJson,
    CONCURRENCY, BATCH_DELAY, 'Pokemon'
  );

  const pokemon = pokemonDetails
    .filter(p => p?.sprites?.front_default)
    .map(p => ({
      id: p.id,
      name: p.name,
      types: p.types.map(t => t.type.name),
      stats: Object.fromEntries(p.stats.map(s => [STAT_MAP[s.stat.name], s.base_stat]).filter(([k]) => k)),
      sprite: p.sprites.front_default,
    }))
    .sort((a, b) => a.id - b.id);

  fs.writeFileSync(path.join(dataDir, 'pokemon.json'), JSON.stringify(pokemon));
  console.log(`Saved ${pokemon.length} Pokemon to pokemon.json`);

  // Moves
  console.log('Fetching moves list...');
  const moveList = await fetchJson(`${BASE}/move?limit=2000&offset=0`);
  console.log(`Got ${moveList.results.length} moves. Fetching details...`);
  const moveDetails = await fetchBatch(
    moveList.results.map(m => m.url),
    fetchJson,
    CONCURRENCY, BATCH_DELAY, 'Moves'
  );

  const moves = moveDetails
    .filter(m => m)
    .map(m => ({
      id: m.id,
      name: m.name,
      type: m.type.name,
      category: m.damage_class.name,
      power: m.power || 0,
    }))
    .sort((a, b) => a.id - b.id);

  fs.writeFileSync(path.join(dataDir, 'moves.json'), JSON.stringify(moves));
  console.log(`Saved ${moves.length} moves to moves.json`);
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
