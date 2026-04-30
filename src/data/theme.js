// Move category badge colors — values defined in index.css :root
export const CAT_COLORS = {
  physical: 'var(--cat-physical)',
  special:  'var(--cat-special)',
  status:   'var(--cat-status)',
};

// Common UI colors — all reference CSS variables defined in index.css.
// To adjust the app's palette, edit the :root block in index.css.
export const UI = {
  cardDark:      'var(--surface-card)',
  cardLight:     'var(--surface-inset)',
  cardBody:      'var(--surface-card)',     // dark body inside tier-colored cards
  divider:       'var(--border-inner)',
  barTrack:      'var(--bar-empty)',
  barTrackLt:    'var(--bar-empty-pastel)',
  barTrackDark:  'var(--bar-empty-dark)',   // bar track on dark card body
  textOnLight:   'var(--text-on-surface)',
  textPrimary:   'var(--text-primary)',     // bright text on dark surfaces
  textSecondary: 'var(--text-secondary)',   // softer text on dark surfaces
  textMuted:     'var(--text-meta)',
  textMove:      'var(--text-label)',
  textAccent:    'var(--text-boost)',
};
