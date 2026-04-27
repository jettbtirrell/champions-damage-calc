import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://pokeapi.co/api/v2';
const CONCURRENCY = 15;
const BATCH_DELAY = 120;

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

async function main() {
  const dataDir = path.join(__dirname, '../src/data');
  const pokemon = JSON.parse(fs.readFileSync(path.join(dataDir, 'pokemon.json'), 'utf8'));

  console.log(`Fetching abilities for ${pokemon.length} Pokémon...`);

  const abilityMap = {};
  const names = pokemon.map(p => p.name);

  for (let i = 0; i < names.length; i += CONCURRENCY) {
    const batch = names.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(
      batch.map(name => fetchJson(`${BASE}/pokemon/${name}`))
    );
    for (let j = 0; j < settled.length; j++) {
      const r = settled[j];
      const name = batch[j];
      if (r.status === 'fulfilled' && r.value?.abilities) {
        abilityMap[name] = r.value.abilities.map(a => a.ability.name);
      } else {
        process.stderr.write(`\nWarn: failed ${name}: ${r.reason?.message}\n`);
      }
    }
    if (i + CONCURRENCY < names.length) await sleep(BATCH_DELAY);
    const done = Math.min(i + CONCURRENCY, names.length);
    process.stdout.write(`\r  ${done}/${names.length} (${Math.round(done / names.length * 100)}%)`);
  }

  process.stdout.write('\n');
  fs.writeFileSync(path.join(dataDir, 'pokemonAbilities.json'), JSON.stringify(abilityMap));
  console.log(`Saved abilities for ${Object.keys(abilityMap).length} Pokémon.`);
}

main().catch(e => { console.error(e); process.exit(1); });
