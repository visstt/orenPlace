import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { COLORS } from './constants';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  music: 'musical-notes',
  'theater-masks': 'ticket-outline',
  palette: 'color-palette-outline',
  futbol: 'football-outline',
  film: 'film-outline',
  star: 'star-outline',
  'paint-brush': 'brush-outline',
  child: 'happy-outline',
};

export function getCategoryIcon(icon?: string): keyof typeof Ionicons.glyphMap {
  return iconMap[icon || ''] || 'calendar-outline';
}

function shadeHex(hex: string, amount: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const num = parseInt(raw, 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function getCoverGradient(category?: Category | null): [string, string, string] {
  const base = category?.color || COLORS.primary;
  return [shadeHex(base, 24), base, shadeHex(base, -48)];
}
