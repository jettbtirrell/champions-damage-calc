import { NATURES } from './natures';

export function calcHP(baseHP, statPoints) {
  return baseHP + (statPoints || 0) + 75;
}

export function calcStat(stat, baseStat, statPoints, nature) {
  const n = NATURES[nature] || NATURES.hardy;
  const mult = n.plus === stat ? 1.1 : n.minus === stat ? 0.9 : 1.0;
  return Math.floor(mult * (baseStat + (statPoints || 0) + 20));
}

export function calcAllStats(pokemon, statPoints, nature) {
  if (!pokemon) return { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const sp = statPoints || {};
  return {
    hp:  calcHP(pokemon.stats.hp, sp.hp),
    atk: calcStat('atk', pokemon.stats.atk, sp.atk, nature),
    def: calcStat('def', pokemon.stats.def, sp.def, nature),
    spa: calcStat('spa', pokemon.stats.spa, sp.spa, nature),
    spd: calcStat('spd', pokemon.stats.spd, sp.spd, nature),
    spe: calcStat('spe', pokemon.stats.spe, sp.spe, nature),
  };
}

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
export const STAT_LABELS = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
export const TOTAL_STAT_POINTS = 66;
export const MAX_PER_STAT = 32;

export function totalPoints(statPoints) {
  return STAT_KEYS.reduce((sum, k) => sum + (statPoints[k] || 0), 0);
}

// Standard Pokemon stat stage multiplier: +1=1.5×, +2=2×, ... +6=4×
export function getBoostMultiplier(stage) {
  if (!stage) return 1;
  return (2 + Math.abs(stage)) / 2;
}

export function applyBoost(stat, stage) {
  return Math.floor(stat * getBoostMultiplier(stage));
}
