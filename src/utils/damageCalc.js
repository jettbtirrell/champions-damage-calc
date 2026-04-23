import { getTypeEffectiveness } from '../data/typeChart';
import { ABILITIES, PUNCH_MOVES, PULSE_MOVES, BITE_MOVES, RECOIL_MOVES } from '../data/abilities';

// TODO phase 2: items, weather modifiers

function applyAbility(ability, moveName, moveType, moveCategory, bp, atk, attackerTypes) {
  const def = ABILITIES[ability];
  if (!def) return { moveType, bp, atk, stabMultiplier: 1.5 };

  let effectiveMoveType = moveType;
  let effectiveBp = bp;
  let effectiveAtk = atk;
  let stabMultiplier = def.stabMultiplier ?? 1.5;

  // -ate abilities: change move type + boost BP
  if (def.ate) {
    const { to, boost, allMoves } = def.ate;
    if (allMoves || moveType === 'normal') {
      effectiveMoveType = to;
      effectiveBp = Math.floor(effectiveBp * boost);
    }
  }

  // Flat Atk multiplier (e.g. Hustle)
  if (def.atkMult) {
    if (!def.physicalOnly || moveCategory === 'physical') {
      effectiveAtk = Math.floor(effectiveAtk * def.atkMult);
    }
  }

  // BP multipliers gated by move condition
  if (def.bpMult) {
    let applies = false;
    switch (def.condition) {
      case 'all':    applies = true; break;
      case 'bp<=60': applies = bp <= 60; break;
      case 'punch':  applies = PUNCH_MOVES.has(moveName); break;
      case 'pulse':  applies = PULSE_MOVES.has(moveName); break;
      case 'bite':   applies = BITE_MOVES.has(moveName); break;
      case 'recoil': applies = RECOIL_MOVES.has(moveName); break;
    }
    if (applies) effectiveBp = Math.floor(effectiveBp * def.bpMult);
  }

  return { moveType: effectiveMoveType, bp: effectiveBp, atk: effectiveAtk, stabMultiplier };
}

export function calcDamage({ bp, atk, def, moveName, attackerTypes, moveType, moveCategory, defenderTypes, ability, burned, weather, item }) {
  if (!bp || bp === 0) return { minDmg: 0, maxDmg: 0, immune: false, noEffect: true };

  const { moveType: effectiveMoveType, bp: effectiveBp, atk: effectiveAtk, stabMultiplier } =
    applyAbility(ability, moveName, moveType, moveCategory, bp, atk, attackerTypes);

  const typeEff = getTypeEffectiveness(effectiveMoveType, defenderTypes);
  if (typeEff === 0) return { minDmg: 0, maxDmg: 0, immune: true, noEffect: false };

  const modifiers = [];

  // STAB (uses post-ability type and per-ability STAB multiplier)
  if (attackerTypes.includes(effectiveMoveType)) {
    modifiers.push(stabMultiplier);
  }

  modifiers.push(typeEff);

  // TODO phase 2: burn → 0.5× on physical if burned
  // if (burned && moveCategory === 'physical') modifiers.push(0.5);

  // Weather
  if (weather === 'sun') {
    if (effectiveMoveType === 'fire')  modifiers.push(1.5);
    if (effectiveMoveType === 'water') modifiers.push(0.5);
  } else if (weather === 'rain') {
    if (effectiveMoveType === 'water') modifiers.push(1.5);
    if (effectiveMoveType === 'fire')  modifiers.push(0.5);
  }
  // Sand and Snow have no direct damage multipliers (chip damage / SpD boost not modelled yet)

  // TODO phase 2: held items
  // if (item === 'life-orb') modifiers.push(1.3);
  // if (item === 'choice-band' && moveCategory === 'physical') modifiers.push(1.5);
  // if (item === 'choice-specs' && moveCategory === 'special') modifiers.push(1.5);

  const totalMod = modifiers.reduce((acc, m) => acc * m, 1);
  const rawDmg = Math.floor(Math.floor(effectiveBp * effectiveAtk * 22 / def) / 50) + 2;
  const baseDmg = Math.floor(rawDmg * totalMod);
  const minDmg = Math.floor(baseDmg * 86 / 100);
  const maxDmg = baseDmg;

  return { minDmg, maxDmg, immune: false, noEffect: false, typeEff, effectiveMoveType };
}
