import { useMemo } from 'react';
import { toDisplayName } from '../utils/importExport';

const ROLES = [
  {
    key: 'intimidate',
    label: 'Intimidate',
    description: 'Lowers both opponents\' Attack on entry',
    bg: '#1a0808', border: '#b91c1c', text: '#fca5a5',
    check: mon => mon.ability === 'intimidate' ? 'Intimidate' : null,
  },
  {
    key: 'speed-control',
    label: 'Speed Control',
    description: 'Tailwind, Trick Room, or speed-reducing moves',
    bg: '#051520', border: '#0284c7', text: '#7dd3fc',
    check: mon => {
      if (mon.moves?.find(m => m.name === 'tailwind')) return 'Tailwind';
      if (mon.moves?.find(m => m.name === 'trick-room')) return 'Trick Room';
      const SLOW = ['icy-wind', 'electroweb', 'bulldoze', 'mud-shot', 'rock-tomb', 'glaciate', 'scary-face', 'string-shot'];
      const m = mon.moves?.find(m => SLOW.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'fake-out',
    label: 'Fake Out',
    description: 'First-turn flinch and momentum',
    bg: '#0f1f35', border: '#2563eb', text: '#93c5fd',
    check: mon => mon.moves?.find(m => m.name === 'fake-out') ? 'Fake Out' : null,
  },
  {
    key: 'taunt',
    label: 'Taunt',
    description: 'Prevents opponent from using status moves',
    bg: '#1a0d00', border: '#ea580c', text: '#fdba74',
    check: mon => mon.moves?.find(m => m.name === 'taunt') ? 'Taunt' : null,
  },
  {
    key: 'priority',
    label: 'Priority',
    description: 'Moves that act before normal speed order',
    bg: '#1a1200', border: '#d97706', text: '#fde68a',
    check: mon => {
      const PRIORITY = ['aqua-jet', 'extreme-speed', 'sucker-punch', 'ice-shard', 'bullet-punch', 'mach-punch', 'shadow-sneak', 'water-shuriken', 'jet-punch', 'first-impression', 'accelerock', 'vacuum-wave', 'quick-attack', 'grassy-glide'];
      const m = mon.moves?.find(m => PRIORITY.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'weather',
    label: 'Weather Setter',
    description: 'Sets rain, sun, sand, or snow via ability or move',
    bg: '#051828', border: '#0369a1', text: '#7dd3fc',
    check: mon => {
      const WEATHER_MOVES = { 'rain-dance': 'Rain Dance', 'sunny-day': 'Sunny Day', 'sandstorm': 'Sandstorm', 'snow': 'Snow', 'hail': 'Hail' };
      const WEATHER_ABILITIES = { 'drizzle': 'Drizzle', 'drought': 'Drought', 'sand-stream': 'Sand Stream', 'snow-warning': 'Snow Warning', 'primordial-sea': 'Primordial Sea', 'desolate-land': 'Desolate Land', 'delta-stream': 'Delta Stream' };
      const m = mon.moves?.find(m => WEATHER_MOVES[m.name]);
      if (m) return WEATHER_MOVES[m.name];
      return mon.ability && WEATHER_ABILITIES[mon.ability] ? WEATHER_ABILITIES[mon.ability] : null;
    },
  },
  {
    key: 'sleep',
    label: 'Sleep',
    description: 'Puts opponents to sleep',
    bg: '#100a25', border: '#7c3aed', text: '#c4b5fd',
    check: mon => {
      const SLEEP_MOVES = ['spore', 'sleep-powder', 'hypnosis', 'yawn', 'dark-void', 'lovely-kiss', 'sing', 'grass-whistle', 'dire-claw'];
      const m = mon.moves?.find(m => SLEEP_MOVES.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'paralysis',
    label: 'Paralysis',
    description: 'Paralyzes opponents via move or ability',
    bg: '#1a1500', border: '#ca8a04', text: '#fde68a',
    check: mon => {
      const PARA_MOVES = ['thunder-wave', 'nuzzle', 'stun-spore', 'glare', 'dire-claw', 'body-slam'];
      const PARA_ABILITIES = ['static', 'effect-spore'];
      const m = mon.moves?.find(m => PARA_MOVES.includes(m.name));
      if (m) return toDisplayName(m.name);
      if (mon.ability && PARA_ABILITIES.includes(mon.ability)) return toDisplayName(mon.ability);
      return null;
    },
  },
  {
    key: 'burn',
    label: 'Burn',
    description: 'Burns opponents via move or ability',
    bg: '#1f0900', border: '#c2410c', text: '#fdba74',
    check: mon => {
      const BURN_MOVES = ['will-o-wisp', 'sacred-fire', 'scald', 'lava-plume', 'dire-claw'];
      const BURN_ABILITIES = ['flame-body'];
      const m = mon.moves?.find(m => BURN_MOVES.includes(m.name));
      if (m) return toDisplayName(m.name);
      if (mon.ability && BURN_ABILITIES.includes(mon.ability)) return toDisplayName(mon.ability);
      return null;
    },
  },
  {
    key: 'support-abilities',
    label: 'Support Abilities',
    description: 'Passive abilities that protect or aid allies',
    bg: '#071a18', border: '#0f766e', text: '#5eead4',
    check: mon => {
      const SUPPORT = { 'hospitality': 'Hospitality', 'friend-guard': 'Friend Guard', 'lightning-rod': 'Lightning Rod', 'healer': 'Healer', 'storm-drain': 'Storm Drain' };
      return mon.ability && SUPPORT[mon.ability] ? SUPPORT[mon.ability] : null;
    },
  },
  {
    key: 'perish-song',
    label: 'Perish Song',
    description: 'All active Pokémon faint after 3 turns',
    bg: '#111827', border: '#6b7280', text: '#d1d5db',
    check: mon => mon.moves?.find(m => m.name === 'perish-song') ? 'Perish Song' : null,
  },
  {
    key: 'redirection',
    label: 'Redirection',
    description: 'Draws single-target moves to self',
    bg: '#1a0e00', border: '#92400e', text: '#fcd34d',
    check: mon => {
      const m = mon.moves?.find(m => ['follow-me', 'rage-powder'].includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'snarl',
    label: 'Snarl',
    description: 'Spread move that lowers both opponents\' Sp. Atk',
    bg: '#0f1117', border: '#4b5563', text: '#9ca3af',
    check: mon => mon.moves?.find(m => m.name === 'snarl') ? 'Snarl' : null,
  },
  {
    key: 'roar',
    label: 'Roar',
    description: 'Forces opponent to switch out',
    bg: '#0f1520', border: '#475569', text: '#94a3b8',
    check: mon => {
      const m = mon.moves?.find(m => ['roar', 'whirlwind', 'dragon-tail', 'circle-throw'].includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'parting-shot',
    label: 'Parting Shot',
    description: 'Lowers opponent\'s offenses then switches out',
    bg: '#0a0b28', border: '#4f46e5', text: '#a5b4fc',
    check: mon => mon.moves?.find(m => m.name === 'parting-shot') ? 'Parting Shot' : null,
  },
  {
    key: 'support-moves',
    label: 'Support Moves',
    description: 'Wide Guard, Quick Guard, Helping Hand, Life Dew, Upper Hand',
    bg: '#071a0f', border: '#15803d', text: '#86efac',
    check: mon => {
      const SUPPORT = ['wide-guard', 'quick-guard', 'helping-hand', 'life-dew', 'upper-hand'];
      const m = mon.moves?.find(m => SUPPORT.includes(m.name));
      return m ? toDisplayName(m.name) : null;
    },
  },
  {
    key: 'spread',
    label: 'Spread Damage',
    description: 'Hits both opponents at once',
    bg: '#1a0812', border: '#be123c', text: '#fda4af',
    check: mon => {
      const SPREAD = ['earthquake', 'surf', 'blizzard', 'heat-wave', 'discharge', 'rock-slide', 'hyper-voice', 'dazzling-gleam', 'muddy-water', 'eruption', 'water-spout', 'glacial-lance', 'astral-barrage', 'lava-plume', 'thousand-arrows', 'breaking-swipe', 'petal-blizzard', 'boomburst', 'overdrive', 'hurricane', 'icy-wind', 'electroweb', 'snarl', 'bulldoze', 'magnitude', 'explosion', 'self-destruct'];
      const m = mon.moves?.find(m => SPREAD.includes(m.name));
      return m ? toDisplayName(m.name) : null;
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
    attackers.filter(m => m.pokemon),
    [attackers]
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
        <p className="text-xs text-gray-500 mb-3">Which competitive roles your attacking team covers. Each role represents a key function in doubles — missing several can leave your team without answers to common strategies.</p>
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

      <div className="pt-2 border-t border-gray-800">
        <p className="text-xs text-gray-600">
          Categories based on the VGC cheat sheet by{' '}
          <span className="text-gray-500">False Swipe Gaming</span>
          {', designed by '}
          <span className="text-gray-500">@JRuva on X / Twitter</span>
        </p>
      </div>
    </div>
  );
}
