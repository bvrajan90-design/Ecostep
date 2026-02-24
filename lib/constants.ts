// EcoStep Color Palette
export const COLORS = {
  sage: '#81B29A',
  sageLight: '#A8D5BA',
  sageDark: '#5E9178',
  offWhite: '#F4F1DE',
  offWhiteLight: '#FAF9F0',
  charcoal: '#3D405B',
  charcoalLight: '#5C5F7A',
  white: '#FFFFFF',
  accent: '#E07A5F',
  accentLight: '#F2CC8F',
  success: '#81B29A',
  shadow: 'rgba(61, 64, 91, 0.08)',
  shadowDark: 'rgba(61, 64, 91, 0.15)',
  cardBg: '#FFFFFF',
  progressBg: 'rgba(129, 178, 154, 0.15)',
  divider: 'rgba(61, 64, 91, 0.08)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 999,
};

export interface GreenTask {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  co2Saved: number; // in kg
  completed: boolean;
}

export const DEFAULT_TASKS: GreenTask[] = [
  {
    id: 'reusable-bag',
    title: 'Used a reusable bag',
    subtitle: 'Avoided single-use plastic',
    icon: 'bag-handle-outline',
    co2Saved: 0.5,
    completed: false,
  },
  {
    id: 'avoided-meat',
    title: 'Avoided meat today',
    subtitle: 'Plant-based meals only',
    icon: 'leaf-outline',
    co2Saved: 0.5,
    completed: false,
  },
  {
    id: 'short-shower',
    title: 'Took a short shower',
    subtitle: 'Under 5 minutes',
    icon: 'water-outline',
    co2Saved: 0.5,
    completed: false,
  },
  {
    id: 'walked-biked',
    title: 'Walked or biked',
    subtitle: 'Chose green transport',
    icon: 'bicycle-outline',
    co2Saved: 0.5,
    completed: false,
  },
  {
    id: 'no-waste',
    title: 'Zero food waste',
    subtitle: 'Finished all meals',
    icon: 'restaurant-outline',
    co2Saved: 0.5,
    completed: false,
  },
  {
    id: 'lights-off',
    title: 'Turned off lights',
    subtitle: 'Saved energy when away',
    icon: 'bulb-outline',
    co2Saved: 0.5,
    completed: false,
  },
];

export const CO2_PER_TASK = 0.5; // kg

export const MOTIVATIONAL_QUOTES = [
  'Every small step counts 🌱',
  'You\'re making a difference! 🌍',
  'Nature thanks you 🌿',
  'Keep up the great work! ✨',
  'One habit at a time 🍃',
  'The Earth smiles at you 🌎',
  'Green living, bright future 🌻',
  'Your choices matter 💚',
];
