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
  normal:   'var(--type-normal)',   fire:     'var(--type-fire)',
  water:    'var(--type-water)',    grass:    'var(--type-grass)',
  electric: 'var(--type-electric)', ice:     'var(--type-ice)',
  fighting: 'var(--type-fighting)', poison:  'var(--type-poison)',
  ground:   'var(--type-ground)',   flying:  'var(--type-flying)',
  psychic:  'var(--type-psychic)',  bug:     'var(--type-bug)',
  rock:     'var(--type-rock)',     ghost:   'var(--type-ghost)',
  dragon:   'var(--type-dragon)',   dark:    'var(--type-dark)',
  steel:    'var(--type-steel)',    fairy:   'var(--type-fairy)',
};
