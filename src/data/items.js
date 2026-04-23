export const ITEMS = {
  // Type-boosting items — ×1.2 to moves of the matching type
  'black-belt':     { label: 'Black Belt',    effect: 'type-boost', type: 'fighting' },
  'black-glasses':  { label: 'Black Glasses', effect: 'type-boost', type: 'dark'     },
  'charcoal':       { label: 'Charcoal',      effect: 'type-boost', type: 'fire'     },
  'dragon-fang':    { label: 'Dragon Fang',   effect: 'type-boost', type: 'dragon'   },
  'fairy-feather':  { label: 'Fairy Feather', effect: 'type-boost', type: 'fairy'    },
  'hard-stone':     { label: 'Hard Stone',    effect: 'type-boost', type: 'rock'     },
  'magnet':         { label: 'Magnet',        effect: 'type-boost', type: 'electric' },
  'metal-coat':     { label: 'Metal Coat',    effect: 'type-boost', type: 'steel'    },
  'miracle-seed':   { label: 'Miracle Seed',  effect: 'type-boost', type: 'grass'    },
  'mystic-water':   { label: 'Mystic Water',  effect: 'type-boost', type: 'water'    },
  'never-melt-ice': { label: 'Never-Melt Ice',effect: 'type-boost', type: 'ice'      },
  'poison-barb':    { label: 'Poison Barb',   effect: 'type-boost', type: 'poison'   },
  'sharp-beak':     { label: 'Sharp Beak',    effect: 'type-boost', type: 'flying'   },
  'silk-scarf':     { label: 'Silk Scarf',    effect: 'type-boost', type: 'normal'   },
  'silver-powder':  { label: 'Silver Powder', effect: 'type-boost', type: 'bug'      },
  'soft-sand':      { label: 'Soft Sand',     effect: 'type-boost', type: 'ground'   },
  'spell-tag':      { label: 'Spell Tag',     effect: 'type-boost', type: 'ghost'    },
  'twisted-spoon':  { label: 'Twisted Spoon', effect: 'type-boost', type: 'psychic'  },
  // Choice items
  'choice-scarf':   { label: 'Choice Scarf',  effect: 'speed-boost', speedMult: 1.5  },
};

export const TYPE_BOOST_ITEMS = Object.entries(ITEMS)
  .filter(([, v]) => v.effect === 'type-boost')
  .sort(([, a], [, b]) => a.label.localeCompare(b.label))
  .map(([k]) => k);
