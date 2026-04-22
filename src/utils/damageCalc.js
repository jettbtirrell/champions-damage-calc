import { getTypeEffectiveness } from '../data/typeChart';

// TODO phase 2: items, abilities, weather modifiers

export function calcDamage({ bp, atk, def, attackerTypes, moveType, moveCategory, defenderTypes, burned, weather, item, ability }) {
  if (!bp || bp === 0) return { minDmg: 0, maxDmg: 0, immune: false, noEffect: true };

  const typeEff = getTypeEffectiveness(moveType, defenderTypes);
  if (typeEff === 0) return { minDmg: 0, maxDmg: 0, immune: true, noEffect: false };

  const modifiers = [];

  // STAB
  const hasStab = attackerTypes.includes(moveType);
  if (hasStab) {
    // TODO phase 2: Adaptability → 2× instead of 1.5×
    modifiers.push(1.5);
  }

  modifiers.push(typeEff);

  // TODO phase 2: burn → 0.5× on physical if burned
  // if (burned && moveCategory === 'physical') modifiers.push(0.5);

  // TODO phase 2: weather
  // if (weather === 'sun') { if (moveType === 'fire') modifiers.push(1.5); if (moveType === 'water') modifiers.push(0.5); }
  // if (weather === 'rain') { if (moveType === 'water') modifiers.push(1.5); if (moveType === 'fire') modifiers.push(0.5); }

  // TODO phase 2: held items
  // if (item === 'life-orb') modifiers.push(1.3);
  // if (item === 'choice-band' && moveCategory === 'physical') modifiers.push(1.5);
  // if (item === 'choice-specs' && moveCategory === 'special') modifiers.push(1.5);

  // TODO phase 2: abilities (Hustle, etc.)

  const totalMod = modifiers.reduce((acc, m) => acc * m, 1);
  const rawDmg = Math.floor(Math.floor(bp * atk * 22 / def) / 50) + 2;
  const baseDmg = Math.floor(rawDmg * totalMod);
  const minDmg = Math.floor(baseDmg * 86 / 100);
  const maxDmg = baseDmg;

  return { minDmg, maxDmg, immune: false, noEffect: false, typeEff, hasStab };
}
