// Chrono India color palette constants
export const PALETTE = {
  bgDeep:       '#1A1410',
  surface:      '#2A221A',
  surface2:     '#352B20',
  accent:       '#C1894E',
  accentLight:  '#D4A96A',
  textPrimary:  '#E8DDD0',
  textMuted:    '#8A7A6A',
  tileable:     '#3D5A3E',
  tileableLight:'#4A6B45',
  danger:       '#8B2020',
  indigo:       '#3B1A6B',
  sky:          '#2A6FBB',
} as const;

export type PaletteKey = keyof typeof PALETTE;

// Category color map
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  terrain:      { bg: 'rgba(74,106,69,0.25)',   text: '#4A6B45', border: 'rgba(74,106,69,0.4)' },
  architecture: { bg: 'rgba(193,137,78,0.25)',  text: '#C1894E', border: 'rgba(193,137,78,0.4)' },
  character:    { bg: 'rgba(139,94,60,0.25)',   text: '#B87040', border: 'rgba(139,94,60,0.4)' },
  vfx:          { bg: 'rgba(59,26,107,0.35)',   text: '#8B5AB5', border: 'rgba(59,26,107,0.5)' },
  props:        { bg: 'rgba(107,66,38,0.25)',   text: '#9B7050', border: 'rgba(107,66,38,0.4)' },
};

export const CATEGORIES = ['terrain', 'architecture', 'character', 'vfx', 'props'] as const;
export type Category = typeof CATEGORIES[number];
