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

// Returns { type, power } after applying ability type-change effects for display purposes.
export function getEffectiveMove(move, ability) {
  const def = ABILITIES[ability];
  if (!def?.ate) return { type: move.type, power: move.power };
  const { to, boost, allMoves } = def.ate;
  if (allMoves || move.type === 'normal') {
    return { type: to, power: boost !== 1 ? Math.floor(move.power * boost) : move.power };
  }
  return { type: move.type, power: move.power };
}

// Human-readable labels for the ability selector
export const ABILITY_LABELS = {
  'adaptability':  'Adaptability (STAB ×2)',
  'aerilate':      'Aerilate (Normal→Flying, BP ×1.2)',
  'dragonize':     'Dragonize (Normal→Dragon, BP ×1.2)',
  'galvanize':     'Galvanize (Normal→Electric, BP ×1.2)',
  'pixilate':      'Pixilate (Normal→Fairy, BP ×1.2)',
  'refrigerate':   'Refrigerate (Normal→Ice, BP ×1.2)',
  'normalize':     'Normalize (All→Normal)',
  'hustle':        'Hustle (Atk ×1.5, physical)',
  'technician':    'Technician (BP≤60 ×1.5)',
  'sheer-force':   'Sheer Force (~BP ×1.3)',
  'iron-fist':     'Iron Fist (punch moves ×1.2)',
  'mega-launcher': 'Mega Launcher (pulse moves ×1.5)',
  'reckless':      'Reckless (recoil moves ×1.2)',
  'strong-jaw':    'Strong Jaw (bite moves ×1.5)',
};
