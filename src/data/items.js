export const ITEMS = {
  // ── Type-boosting items — ×1.2 to moves of the matching type ──────────────
  'black-belt':     { label: 'Black Belt',     effect: 'type-boost', type: 'fighting' },
  'black-glasses':  { label: 'Black Glasses',  effect: 'type-boost', type: 'dark'     },
  'charcoal':       { label: 'Charcoal',       effect: 'type-boost', type: 'fire'     },
  'dragon-fang':    { label: 'Dragon Fang',    effect: 'type-boost', type: 'dragon'   },
  'fairy-feather':  { label: 'Fairy Feather',  effect: 'type-boost', type: 'fairy'    },
  'hard-stone':     { label: 'Hard Stone',     effect: 'type-boost', type: 'rock'     },
  'magnet':         { label: 'Magnet',         effect: 'type-boost', type: 'electric' },
  'metal-coat':     { label: 'Metal Coat',     effect: 'type-boost', type: 'steel'    },
  'miracle-seed':   { label: 'Miracle Seed',   effect: 'type-boost', type: 'grass'    },
  'mystic-water':   { label: 'Mystic Water',   effect: 'type-boost', type: 'water'    },
  'never-melt-ice': { label: 'Never-Melt Ice', effect: 'type-boost', type: 'ice'      },
  'poison-barb':    { label: 'Poison Barb',    effect: 'type-boost', type: 'poison'   },
  'sharp-beak':     { label: 'Sharp Beak',     effect: 'type-boost', type: 'flying'   },
  'silk-scarf':     { label: 'Silk Scarf',     effect: 'type-boost', type: 'normal'   },
  'silver-powder':  { label: 'Silver Powder',  effect: 'type-boost', type: 'bug'      },
  'soft-sand':      { label: 'Soft Sand',      effect: 'type-boost', type: 'ground'   },
  'spell-tag':      { label: 'Spell Tag',      effect: 'type-boost', type: 'ghost'    },
  'twisted-spoon':  { label: 'Twisted Spoon',  effect: 'type-boost', type: 'psychic'  },

  // ── Choice items ───────────────────────────────────────────────────────────
  'choice-scarf':   { label: 'Choice Scarf',   effect: 'speed-boost', speedMult: 1.5 },
  'choice-band':    { label: 'Choice Band',    effect: 'none' },
  'choice-specs':   { label: 'Choice Specs',   effect: 'none' },

  // ── Power items ────────────────────────────────────────────────────────────
  'life-orb':       { label: 'Life Orb',       effect: 'none' },
  'expert-belt':    { label: 'Expert Belt',    effect: 'none' },
  'white-herb':     { label: 'White Herb',     effect: 'none' },
  'weakness-policy':{ label: 'Weakness Policy',effect: 'none' },
  'booster-energy': { label: 'Booster Energy', effect: 'none' },
  'throat-spray':   { label: 'Throat Spray',   effect: 'none' },
  'power-herb':     { label: 'Power Herb',     effect: 'none' },
  'blunder-policy': { label: 'Blunder Policy', effect: 'none' },
  'loaded-dice':    { label: 'Loaded Dice',    effect: 'none' },
  'scope-lens':     { label: 'Scope Lens',     effect: 'none' },
  'wide-lens':      { label: 'Wide Lens',      effect: 'none' },
  'zoom-lens':      { label: 'Zoom Lens',      effect: 'none' },

  // ── Defensive items ────────────────────────────────────────────────────────
  'assault-vest':   { label: 'Assault Vest',   effect: 'none' },
  'focus-sash':     { label: 'Focus Sash',     effect: 'none' },
  'rocky-helmet':   { label: 'Rocky Helmet',   effect: 'none' },
  'protective-pads':{ label: 'Protective Pads',effect: 'none' },
  'leftovers':      { label: 'Leftovers',      effect: 'none' },
  'black-sludge':   { label: 'Black Sludge',   effect: 'none' },
  'shell-bell':     { label: 'Shell Bell',     effect: 'none' },

  // ── Utility ────────────────────────────────────────────────────────────────
  'mental-herb':    { label: 'Mental Herb',    effect: 'none' },
  'eject-button':   { label: 'Eject Button',   effect: 'none' },
  'red-card':       { label: 'Red Card',       effect: 'none' },
  'safety-goggles': { label: 'Safety Goggles', effect: 'none' },
  'covert-cloak':   { label: 'Covert Cloak',   effect: 'none' },
  'clear-amulet':   { label: 'Clear Amulet',   effect: 'none' },
  'adrenaline-orb': { label: 'Adrenaline Orb', effect: 'none' },
  'room-service':   { label: 'Room Service',   effect: 'none' },
  'shed-shell':     { label: 'Shed Shell',     effect: 'none' },

  // ── Status orbs ────────────────────────────────────────────────────────────
  'flame-orb':      { label: 'Flame Orb',      effect: 'none' },
  'toxic-orb':      { label: 'Toxic Orb',      effect: 'none' },

  // ── Terrain seeds ──────────────────────────────────────────────────────────
  'electric-seed':  { label: 'Electric Seed',  effect: 'none' },
  'grassy-seed':    { label: 'Grassy Seed',    effect: 'none' },
  'misty-seed':     { label: 'Misty Seed',     effect: 'none' },
  'psychic-seed':   { label: 'Psychic Seed',   effect: 'none' },

  // ── Berries — Recovery ─────────────────────────────────────────────────────
  'sitrus-berry':   { label: 'Sitrus Berry',   effect: 'none' },
  'oran-berry':     { label: 'Oran Berry',     effect: 'none' },
  'lum-berry':      { label: 'Lum Berry',      effect: 'none' },
  'chesto-berry':   { label: 'Chesto Berry',   effect: 'none' },
  'leppa-berry':    { label: 'Leppa Berry',    effect: 'none' },
  'figy-berry':     { label: 'Figy Berry',     effect: 'none' },
  'wiki-berry':     { label: 'Wiki Berry',     effect: 'none' },
  'mago-berry':     { label: 'Mago Berry',     effect: 'none' },
  'aguav-berry':    { label: 'Aguav Berry',    effect: 'none' },
  'iapapa-berry':   { label: 'Iapapa Berry',   effect: 'none' },

  // ── Berries — Resistance (halve super-effective damage once) ───────────────
  'chople-berry':   { label: 'Chople Berry',   effect: 'none' },
  'occa-berry':     { label: 'Occa Berry',     effect: 'none' },
  'passho-berry':   { label: 'Passho Berry',   effect: 'none' },
  'wacan-berry':    { label: 'Wacan Berry',    effect: 'none' },
  'rindo-berry':    { label: 'Rindo Berry',    effect: 'none' },
  'yache-berry':    { label: 'Yache Berry',    effect: 'none' },
  'chilan-berry':   { label: 'Chilan Berry',   effect: 'none' },
  'kebia-berry':    { label: 'Kebia Berry',    effect: 'none' },
  'shuca-berry':    { label: 'Shuca Berry',    effect: 'none' },
  'coba-berry':     { label: 'Coba Berry',     effect: 'none' },
  'payapa-berry':   { label: 'Payapa Berry',   effect: 'none' },
  'tanga-berry':    { label: 'Tanga Berry',    effect: 'none' },
  'charti-berry':   { label: 'Charti Berry',   effect: 'none' },
  'kasib-berry':    { label: 'Kasib Berry',    effect: 'none' },
  'haban-berry':    { label: 'Haban Berry',    effect: 'none' },
  'colbur-berry':   { label: 'Colbur Berry',   effect: 'none' },
  'babiri-berry':   { label: 'Babiri Berry',   effect: 'none' },
  'roseli-berry':   { label: 'Roseli Berry',   effect: 'none' },

  // ── Berries — Pinch (activate at ≤25% HP) ─────────────────────────────────
  'liechi-berry':   { label: 'Liechi Berry',   effect: 'none' },
  'ganlon-berry':   { label: 'Ganlon Berry',   effect: 'none' },
  'salac-berry':    { label: 'Salac Berry',    effect: 'none' },
  'petaya-berry':   { label: 'Petaya Berry',   effect: 'none' },
  'apicot-berry':   { label: 'Apicot Berry',   effect: 'none' },
  'lansat-berry':   { label: 'Lansat Berry',   effect: 'none' },
  'starf-berry':    { label: 'Starf Berry',    effect: 'none' },
  'enigma-berry':   { label: 'Enigma Berry',   effect: 'none' },
  'micle-berry':    { label: 'Micle Berry',    effect: 'none' },
  'custap-berry':   { label: 'Custap Berry',   effect: 'none' },
};

export const TYPE_BOOST_ITEMS = Object.entries(ITEMS)
  .filter(([, v]) => v.effect === 'type-boost')
  .sort(([, a], [, b]) => a.label.localeCompare(b.label))
  .map(([k]) => k);

// Grouped structure for the item select UI
export const ITEM_GROUPS = [
  { label: 'Type Boosters (×1.2)',    keys: TYPE_BOOST_ITEMS },
  { label: 'Choice Items',            keys: ['choice-band', 'choice-specs', 'choice-scarf'] },
  { label: 'Power Items',             keys: ['life-orb', 'expert-belt', 'white-herb', 'weakness-policy', 'booster-energy', 'throat-spray', 'power-herb', 'blunder-policy', 'loaded-dice', 'scope-lens', 'wide-lens', 'zoom-lens'] },
  { label: 'Defensive Items',         keys: ['assault-vest', 'focus-sash', 'rocky-helmet', 'protective-pads', 'leftovers', 'black-sludge', 'shell-bell'] },
  { label: 'Utility',                 keys: ['mental-herb', 'eject-button', 'red-card', 'safety-goggles', 'covert-cloak', 'clear-amulet', 'adrenaline-orb', 'room-service', 'shed-shell'] },
  { label: 'Status Orbs',             keys: ['flame-orb', 'toxic-orb'] },
  { label: 'Terrain Seeds',           keys: ['electric-seed', 'grassy-seed', 'misty-seed', 'psychic-seed'] },
  { label: 'Berries — Recovery',      keys: ['sitrus-berry', 'oran-berry', 'lum-berry', 'chesto-berry', 'leppa-berry', 'figy-berry', 'wiki-berry', 'mago-berry', 'aguav-berry', 'iapapa-berry'] },
  { label: 'Berries — Resistance',    keys: ['chople-berry', 'occa-berry', 'passho-berry', 'wacan-berry', 'rindo-berry', 'yache-berry', 'chilan-berry', 'kebia-berry', 'shuca-berry', 'coba-berry', 'payapa-berry', 'tanga-berry', 'charti-berry', 'kasib-berry', 'haban-berry', 'colbur-berry', 'babiri-berry', 'roseli-berry'] },
  { label: 'Berries — Pinch',         keys: ['liechi-berry', 'ganlon-berry', 'salac-berry', 'petaya-berry', 'apicot-berry', 'lansat-berry', 'starf-berry', 'enigma-berry', 'micle-berry', 'custap-berry'] },
];
