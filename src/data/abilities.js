// Abilities that affect damage calculation.
// Each entry describes what the ability does so damageCalc can apply it generically.

export const ABILITIES = {
  // ── Type-changing (-ate) abilities ─────────────────────────────────────────
  // Change Normal-type moves to another type and boost their BP by 20%.
  'adaptability':  { stabMultiplier: 2.0 },
  'aerilate':      { ate: { to: 'flying',   boost: 1.2 } },
  'dragonize':     { ate: { to: 'dragon',   boost: 1.2 } },
  'galvanize':     { ate: { to: 'electric', boost: 1.2 } },
  'pixilate':      { ate: { to: 'fairy',    boost: 1.2 } },
  'refrigerate':   { ate: { to: 'ice',      boost: 1.2 } },
  'normalize':     { ate: { to: 'normal',   boost: 1.0, allMoves: true } },

  // ── Flat stat multipliers ───────────────────────────────────────────────────
  'hustle':        { atkMult: 1.5, physicalOnly: true },

  // ── BP multipliers ──────────────────────────────────────────────────────────
  'technician':    { bpMult: 1.5,  condition: 'bp<=60' },
  'sheer-force':   { bpMult: 1.3,  condition: 'all' },    // approximation — real Sheer Force only applies to moves with secondary effects
  'iron-fist':     { bpMult: 1.2,  condition: 'punch' },
  'mega-launcher': { bpMult: 1.5,  condition: 'pulse' },
  'reckless':      { bpMult: 1.2,  condition: 'recoil' },
  'strong-jaw':    { bpMult: 1.5,  condition: 'bite' },

  // TODO: tough-claws (contact moves ×1.3) — needs per-move contact flag from API
  // TODO: sand-force (rock/steel/ground in sand ×1.3) — needs weather integration
};

// ── Move flag lists (hardcoded) ─────────────────────────────────────────────
export const PUNCH_MOVES = new Set([
  'bullet-punch','comet-punch','dizzy-punch','drain-punch','dynamic-punch',
  'fire-punch','focus-punch','hammer-arm','ice-hammer','ice-punch','mach-punch',
  'mega-punch','meteor-mash','plasma-fists','power-up-punch','shadow-punch',
  'sky-uppercut','surging-strikes','thunder-punch','wicked-blow','axe-kick',
  'jet-punch',
]);

export const PULSE_MOVES = new Set([
  'aura-sphere','dark-pulse','dragon-pulse','heal-pulse','origin-pulse',
  'oblivion-wing','water-pulse','terrain-pulse',
]);

export const BITE_MOVES = new Set([
  'bite','crunch','fire-fang','ice-fang','thunder-fang','poison-fang',
  'psychic-fangs','jaw-lock','hyper-fang','fishious-rend','bug-bite',
]);

export const RECOIL_MOVES = new Set([
  'brave-bird','double-edge','flare-blitz','head-charge','head-smash',
  'high-jump-kick','jump-kick','submission','take-down','volt-tackle',
  'wild-charge','wood-hammer','chloroblast','supercell-slam',
]);

const WEATHER_BALL_TYPE = { sun: 'fire', rain: 'water', sand: 'rock', snow: 'ice' };

// Returns { type, power } after applying weather-ball and ability type-change effects for display purposes.
export function getEffectiveMove(move, ability, weather = 'none') {
  let type = move.type;
  let power = move.power;

  // Weather Ball: type and power depend on active weather
  if (move.name === 'weather-ball' && weather && weather !== 'none') {
    type = WEATHER_BALL_TYPE[weather] ?? type;
    power = 100;
  }

  const def = ABILITIES[ability];
  if (!def?.ate) return { type, power };
  const { to, boost, allMoves } = def.ate;
  if (allMoves || type === 'normal') {
    return { type: to, power: boost !== 1 ? Math.floor(power * boost) : power };
  }
  return { type, power };
}

// Human-readable labels for the ability selector
export const ABILITY_LABELS = {
  // ── Damage modifiers (coded) ──────────────────────────────────────────────
  'adaptability':    'Adaptability (STAB ×2)',
  'aerilate':        'Aerilate (Normal→Flying, BP ×1.2)',
  'dragonize':       'Dragonize (Normal→Dragon, BP ×1.2)',
  'galvanize':       'Galvanize (Normal→Electric, BP ×1.2)',
  'pixilate':        'Pixilate (Normal→Fairy, BP ×1.2)',
  'refrigerate':     'Refrigerate (Normal→Ice, BP ×1.2)',
  'normalize':       'Normalize (All→Normal)',
  'hustle':          'Hustle (Atk ×1.5, physical)',
  'technician':      'Technician (BP≤60 ×1.5)',
  'sheer-force':     'Sheer Force (~BP ×1.3)',
  'iron-fist':       'Iron Fist (punch moves ×1.2)',
  'mega-launcher':   'Mega Launcher (pulse moves ×1.5)',
  'reckless':        'Reckless (recoil moves ×1.2)',
  'strong-jaw':      'Strong Jaw (bite moves ×1.5)',

  // ── Common VGC / Champions abilities (display only) ───────────────────────
  'intimidate':      'Intimidate',
  'unburden':        'Unburden',
  'speed-boost':     'Speed Boost',
  'swift-swim':      'Swift Swim',
  'chlorophyll':     'Chlorophyll',
  'slush-rush':      'Slush Rush',
  'sand-rush':       'Sand Rush',
  'sand-force':      'Sand Force',
  'surge-surfer':    'Surge Surfer',
  'protean':         'Protean',
  'libero':          'Libero',
  'levitate':        'Levitate',
  'lightning-rod':   'Lightning Rod',
  'storm-drain':     'Storm Drain',
  'water-absorb':    'Water Absorb',
  'volt-absorb':     'Volt Absorb',
  'flash-fire':      'Flash Fire',
  'sap-sipper':      'Sap Sipper',
  'earth-eater':     'Earth Eater',
  'well-baked-body': 'Well-Baked Body',
  'wind-rider':      'Wind Rider',
  'magic-bounce':    'Magic Bounce',
  'magic-guard':     'Magic Guard',
  'prankster':       'Prankster',
  'defiant':         'Defiant',
  'competitive':     'Competitive',
  'clear-body':      'Clear Body',
  'white-smoke':     'White Smoke',
  'inner-focus':     'Inner Focus',
  'own-tempo':       'Own Tempo',
  'oblivious':       'Oblivious',
  'aroma-veil':      'Aroma Veil',
  'flower-veil':     'Flower Veil',
  'sweet-veil':      'Sweet Veil',
  'friend-guard':    'Friend Guard',
  'helping-hand':    'Helping Hand',
  'plus':            'Plus',
  'minus':           'Minus',
  'drizzle':         'Drizzle',
  'drought':         'Drought',
  'sand-stream':     'Sand Stream',
  'snow-warning':    'Snow Warning',
  'electric-surge':  'Electric Surge',
  'grassy-surge':    'Grassy Surge',
  'misty-surge':     'Misty Surge',
  'psychic-surge':   'Psychic Surge',
  'grim-neigh':      'Grim Neigh',
  'chilling-neigh':  'Chilling Neigh',
  'as-one-ice-rider':    'As One (Ice Rider)',
  'as-one-shadow-rider': 'As One (Shadow Rider)',
  'vessel-of-ruin':  'Vessel of Ruin',
  'sword-of-ruin':   'Sword of Ruin',
  'tablets-of-ruin': 'Tablets of Ruin',
  'beads-of-ruin':   'Beads of Ruin',
  'orichalcum-pulse':'Orichalcum Pulse',
  'hadron-engine':   'Hadron Engine',
  'good-as-gold':    'Good as Gold',
  'purifying-salt':  'Purifying Salt',
  'anger-shell':     'Anger Shell',
  'armor-tail':      'Armor Tail',
  'commander':       'Commander',
  'costar':          'Costar',
  'opportunist':     'Opportunist',
  'rocky-payload':   'Rocky Payload',
  'toxic-chain':     'Toxic Chain',
  'super-luck':      'Super Luck',
  'sniper':          'Sniper',
  'tinted-lens':     'Tinted Lens',
  'filter':          'Filter',
  'solid-rock':      'Solid Rock',
  'prism-armor':     'Prism Armor',
  'multiscale':      'Multiscale',
  'shadow-shield':   'Shadow Shield',
  'stamina':         'Stamina',
  'dauntless-shield':'Dauntless Shield',
  'intrepid-sword':  'Intrepid Sword',
  'download':        'Download',
  'analytic':        'Analytic',
  'moxie':           'Moxie',
  'beast-boost':     'Beast Boost',
  'gorilla-tactics': 'Gorilla Tactics',
  'guts':            'Guts',
  'quick-feet':      'Quick Feet',
  'poison-heal':     'Poison Heal',
  'toxic-boost':     'Toxic Boost',
  'thick-fat':       'Thick Fat',
  'heatproof':       'Heatproof',
  'water-bubble':    'Water Bubble',
  'steelworker':     'Steelworker',
  'punk-rock':       'Punk Rock',
  'transistor':      'Transistor',
  'dragons-maw':     "Dragon's Maw",
  'stakeout':        'Stakeout',
  'neuroforce':      'Neuroforce',
  'ice-scales':      'Ice Scales',
  'fluffy':          'Fluffy',
  'fur-coat':        'Fur Coat',
  'cotton-down':     'Cotton Down',
  'neutralizing-gas':'Neutralizing Gas',
  'mimicry':         'Mimicry',
  'perish-body':     'Perish Body',
  'wandering-spirit':'Wandering Spirit',
  'unseen-fist':     'Unseen Fist',
  'zero-to-hero':    'Zero to Hero',
  'mycelium-might':  'Mycelium Might',
  'guard-dog':       'Guard Dog',
  'wind-power':      'Wind Power',
  'electromorphosis':'Electromorphosis',
  'protosynthesis':  'Protosynthesis',
  'quark-drive':     'Quark Drive',
  'supreme-overlord':'Supreme Overlord',
  'unaware':         'Unaware',
  'serene-grace':    'Serene Grace',
  'compound-eyes':   'Compound Eyes',
  'no-guard':        'No Guard',
  'poison-point':    'Poison Point',
  'static':          'Static',
  'flame-body':      'Flame Body',
  'effect-spore':    'Effect Spore',
  'rough-skin':      'Rough Skin',
  'iron-barbs':      'Iron Barbs',
  'aftermath':       'Aftermath',
  'shadow-tag':      'Shadow Tag',
  'arena-trap':      'Arena Trap',
  'magnet-pull':     'Magnet Pull',
  'trace':           'Trace',
  'receiver':        'Receiver',
  'power-of-alchemy':'Power of Alchemy',
  'imposter':        'Imposter',
  'schooling':       'Schooling',
  'battle-bond':     'Battle Bond',
  'power-construct': 'Power Construct',
  'disguise':        'Disguise',
  'ice-face':        'Ice Face',
  'hunger-switch':   'Hunger Switch',
  'zen-mode':        'Zen Mode',
};
