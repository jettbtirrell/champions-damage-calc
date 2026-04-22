// Attack type → { defending type: multiplier } — omitted entries default to 1×
export const TYPE_CHART = {
  normal:   { rock: 0.5, steel: 0.5, ghost: 0 },
  fire:     { fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5, grass: 2, ice: 2, bug: 2, steel: 2 },
  water:    { water: 0.5, grass: 0.5, dragon: 0.5, fire: 2, ground: 2, rock: 2 },
  grass:    { fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5, water: 2, ground: 2, rock: 2 },
  electric: { grass: 0.5, electric: 0.5, dragon: 0.5, ground: 0, water: 2, flying: 2 },
  ice:      { fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2 },
  fighting: { poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5, ghost: 0, normal: 2, ice: 2, rock: 2, dark: 2, steel: 2 },
  poison:   { poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, grass: 2, fairy: 2 },
  ground:   { grass: 0.5, bug: 0.5, flying: 0, fire: 2, electric: 2, poison: 2, rock: 2, steel: 2 },
  flying:   { rock: 0.5, steel: 0.5, electric: 0.5, grass: 2, fighting: 2, bug: 2 },
  psychic:  { steel: 0.5, psychic: 0.5, dark: 0, fighting: 2, poison: 2 },
  bug:      { fire: 0.5, fighting: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5, grass: 2, psychic: 2, dark: 2 },
  rock:     { fighting: 0.5, ground: 0.5, steel: 0.5, fire: 2, ice: 2, flying: 2, bug: 2 },
  ghost:    { normal: 0, dark: 0.5, ghost: 2, psychic: 2 },
  dragon:   { steel: 0.5, fairy: 0, dragon: 2 },
  dark:     { fighting: 0.5, dark: 0.5, fairy: 0.5, psychic: 2, ghost: 2 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5, ice: 2, rock: 2, fairy: 2 },
  fairy:    { fire: 0.5, poison: 0.5, steel: 0.5, fighting: 2, dragon: 2, dark: 2 },
};

export function getTypeEffectiveness(moveType, defenderTypes) {
  const chart = TYPE_CHART[moveType] || {};
  return defenderTypes.reduce((mult, defType) => mult * (chart[defType] ?? 1), 1);
}

export const TYPE_COLORS = {
  normal: '#9CA3AF', fire: '#F97316', water: '#60A5FA', grass: '#4ADE80',
  electric: '#FBBF24', ice: '#67E8F9', fighting: '#EF4444', poison: '#A855F7',
  ground: '#D97706', flying: '#818CF8', psychic: '#EC4899', bug: '#84CC16',
  rock: '#A8A29E', ghost: '#6B21A8', dragon: '#7C3AED', dark: '#374151',
  steel: '#94A3B8', fairy: '#F9A8D4',
};
