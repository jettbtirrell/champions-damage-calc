import { useMemo } from 'react';
import { toDisplayName } from '../utils/importExport';

const ROLES = [
  {
    key: 'fake-out',
    label: 'Fake Out',
    description: 'First-turn flinch and momentum',
    bg: '#0f1f35', border: '#2563eb', text: '#93c5fd',
    check: mon => mon.moves?.find(m => m.name === 'fake-out') ? 'Fake Out' : null,
  },
  {
    key: 'tailwind',
    label: 'Tailwind',
    description: 'Doubles team speed for 4 turns',
    bg: '#0b1f14', border: '#16a34a', text: '#86efac',
    check: mon => mon.moves?.find(m => m.name === 'tailwind') ? 'Tailwind' : null,
  },
  {
    key: 'trick-room',
    label: 'Trick Room',
    description: 'Reverses speed order for 5 turns',
    bg: '#140d30', border: '#7c3aed', text: '#c4b5fd',
    check: mon => mon.moves?.find(m => m.name === 'trick-room') ? 'Trick Room' : null,
  },
  {
    key: 'redirection',
    label: 'Redirection',
    description: 'Draws single-target moves away from partner',
    bg: '#1f1000', border: '#c2410c', text: '#fdba74',
    check: mon => {
      const m = mon.moves?.find(m => ['follow-me', 'rage-powder'].includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'intimidate',
    label: 'Intimidate',
    description: 'Lowers both opponents\' Attack on entry',
    bg: '#1a0a0a', border: '#b91c1c', text: '#fca5a5',
    check: mon => mon.ability === 'intimidate' ? 'Intimidate' : null,
  },
  {
    key: 'speed-control',
    label: 'Speed Control',
    description: 'Slows, paralyzes, or denies opponent speed',
    bg: '#0a1520', border: '#0284c7', text: '#7dd3fc',
    check: mon => {
      const SLOW = ['icy-wind', 'electroweb', 'bulldoze', 'mud-shot', 'thunder-wave', 'scary-face', 'string-shot', 'rock-tomb', 'glaciate'];
      const m = mon.moves?.find(m => SLOW.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'priority',
    label: 'Priority',
    description: 'Moves that act before normal speed order',
    bg: '#1a1500', border: '#a16207', text: '#fde68a',
    check: mon => {
      const PRIORITY = ['quick-attack', 'bullet-punch', 'aqua-jet', 'mach-punch', 'sucker-punch', 'extreme-speed', 'ice-shard', 'shadow-sneak', 'water-shuriken', 'jet-punch', 'first-impression', 'accelerock', 'grassy-glide', 'vacuum-wave'];
      const m = mon.moves?.find(m => PRIORITY.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'pivot',
    label: 'Pivot',
    description: 'Switches out while maintaining pressure',
    bg: '#0d0d25', border: '#4338ca', text: '#a5b4fc',
    check: mon => {
      const PIVOT = ['u-turn', 'volt-switch', 'flip-turn', 'parting-shot', 'teleport', 'chilly-reception'];
      const m = mon.moves?.find(m => PIVOT.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'spread',
    label: 'Spread Damage',
    description: 'Hits both opponents at once',
    bg: '#1a0808', border: '#9f1239', text: '#fda4af',
    check: mon => {
      const SPREAD = ['earthquake', 'surf', 'blizzard', 'heat-wave', 'discharge', 'rock-slide', 'hyper-voice', 'dazzling-gleam', 'muddy-water', 'eruption', 'water-spout', 'glacial-lance', 'astral-barrage', 'snarl', 'lava-plume', 'thousand-arrows', 'breaking-swipe', 'electroweb', 'muddy-water', 'petal-blizzard'];
      const m = mon.moves?.find(m => SPREAD.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'weather',
    label: 'Weather Setting',
    description: 'Sets rain, sun, sand, or snow',
    bg: '#091520', border: '#0369a1', text: '#7dd3fc',
    check: mon => {
      const WEATHER_MOVES = { 'rain-dance': 'Rain Dance', 'sunny-day': 'Sunny Day', 'sandstorm': 'Sandstorm', 'snow': 'Snow', 'hail': 'Hail' };
      const WEATHER_ABILITIES = { 'drizzle': 'Drizzle', 'drought': 'Drought', 'sand-stream': 'Sand Stream', 'snow-warning': 'Snow Warning' };
      const m = mon.moves?.find(m => WEATHER_MOVES[m.name]);
      if (m) return WEATHER_MOVES[m.name];
      return mon.ability && WEATHER_ABILITIES[mon.ability] ? WEATHER_ABILITIES[mon.ability] : null;
    },
  },
  {
    key: 'screens',
    label: 'Screens',
    description: 'Halves damage taken for 5 turns',
    bg: '#091a1a', border: '#0f766e', text: '#5eead4',
    check: mon => {
      const m = mon.moves?.find(m => ['reflect', 'light-screen', 'aurora-veil'].includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'boost',
    label: 'Stat Boost',
    description: 'Sharply raises own or ally offensive/defensive stats',
    bg: '#130820', border: '#9333ea', text: '#d8b4fe',
    check: mon => {
      const BOOSTS = ['swords-dance', 'nasty-plot', 'calm-mind', 'quiver-dance', 'dragon-dance', 'bulk-up', 'iron-defense', 'coaching', 'decorate', 'clangorous-soul', 'shell-smash', 'work-up', 'growth'];
      const m = mon.moves?.find(m => BOOSTS.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'item-removal',
    label: 'Item Removal',
    description: 'Removes or steals opponents\' held items',
    bg: '#1a1200', border: '#92400e', text: '#fcd34d',
    check: mon => {
      const m = mon.moves?.find(m => ['knock-off', 'trick', 'switcheroo', 'thief', 'covet', 'pluck', 'bug-bite'].includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'terrain',
    label: 'Terrain',
    description: 'Sets electric, grassy, misty, or psychic terrain',
    bg: '#0a1a0a', border: '#15803d', text: '#86efac',
    check: mon => {
      const T = { 'electric-terrain': 'Electric Terrain', 'grassy-terrain': 'Grassy Terrain', 'misty-terrain': 'Misty Terrain', 'psychic-terrain': 'Psychic Terrain' };
      const m = mon.moves?.find(m => T[m.name]);
      return m ? T[m.name] : null;
    },
  },
];

function MemberChip({ mon, reason }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-900/80 rounded px-1.5 py-1">
      <img
        src={mon.pokemon.artwork || mon.pokemon.sprite}
        onError={e => { if (mon.pokemon.sprite) e.target.src = mon.pokemon.sprite; }}
        alt="" className="w-8 h-8 object-contain shrink-0"
      />
      <div>
        <div className="text-xs text-gray-200 leading-tight">{toDisplayName(mon.pokemon.name)}</div>
        <div className="text-gray-500 leading-tight" style={{ fontSize: 10 }}>{reason}</div>
      </div>
    </div>
  );
}

function RoleBucket({ role, members }) {
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: role.border, backgroundColor: role.bg }}>
      <div className="px-3 py-2 flex items-baseline justify-between border-b" style={{ borderColor: role.border + '55' }}>
        <div>
          <span className="text-sm font-semibold" style={{ color: role.text }}>{role.label}</span>
          <span className="text-xs text-gray-500 ml-2">{role.description}</span>
        </div>
        <span className="text-xs shrink-0 ml-2" style={{ color: role.text + '99' }}>{members.length}</span>
      </div>
      <div className="p-2 flex flex-wrap gap-2">
        {members.map(({ mon, reason }) => (
          <MemberChip key={mon.id} mon={mon} reason={reason} />
        ))}
      </div>
    </div>
  );
}

export default function RolesTab({ attackers, defenders }) {
  const team = useMemo(() =>
    [...attackers, ...defenders].filter(m => m.pokemon),
    [attackers, defenders]
  );

  const roleResults = useMemo(() =>
    ROLES.map(role => ({
      role,
      members: team.map(mon => ({ mon, reason: role.check(mon) })).filter(({ reason }) => reason !== null),
    })),
    [team]
  );

  if (team.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
        Add Pokémon to your team to see role coverage.
      </div>
    );
  }

  const covered = roleResults.filter(r => r.members.length > 0);
  const missing = roleResults.filter(r => r.members.length === 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      <div>
        <div className="text-xs text-gray-500 mb-3">
          {covered.length} of {ROLES.length} roles covered
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {covered.map(({ role, members }) => (
            <RoleBucket key={role.key} role={role} members={members} />
          ))}
        </div>
      </div>

      {missing.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-2">Not covered</div>
          <div className="flex flex-wrap gap-2">
            {missing.map(({ role }) => (
              <div key={role.key} className="px-2.5 py-1 rounded border border-gray-800 bg-gray-900/40">
                <span className="text-xs text-gray-500 font-medium">{role.label}</span>
                <span className="text-xs text-gray-700 ml-1.5 hidden sm:inline">{role.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
