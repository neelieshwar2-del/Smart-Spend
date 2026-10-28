/**
 * SmartSpend — Design Tokens & Theme Specification
 * Implements Section 5 Android UI/UX & index.html Neo-Fintech Design System
 */

export const LightColors = {
  // Brand & Accents (Neo-Fintech)
  primary: '#01081A',              // Deepest midnight navy
  primaryContainer: '#172033',     // Deep slate navy hero card
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#7F879F',   // Muted slate label for dark cards
  
  secondary: '#416900',            // Deep lime green
  secondaryContainer: '#B6F16A',   // Vibrant neo-lime accent
  onSecondaryContainer: '#102000', // Deep olive text on neo-lime
  secondaryFixed: '#B9F46C',       // Neo-lime button/indicator
  
  accent: '#B6F16A',               // Backward-compat: Vibrant neo-lime
  accentDark: '#416900',           // Backward-compat: Dark lime
  
  // Surfaces & Backgrounds
  background: '#F9F9FF',           // Soft alabaster canvas (from index.html surface)
  surface: '#F9F9FF',
  surfaceContainerLowest: '#FFFFFF',// Pure white cards
  surfaceContainerLow: '#F0F3FF',  // Soft input background
  surfaceContainer: '#E7EEFF',     // Subtle gauge track, inactive chips
  surfaceContainerHigh: '#E0E8FC', // Elevated chips/notches
  surfaceContainerHighest: '#DBE2F6',
  
  card: '#FFFFFF',                 // Pure white card surfaces
  cardSubtle: '#F0F3FF',           // Soft contrast input fill
  
  // Typography
  textPrimary: '#141C29',          // High-contrast on-surface text
  textSecondary: '#45474C',        // On-surface-variant slate text
  textMuted: '#76777D',            // Outline muted text
  textInverse: '#FFFFFF',          // Pure white on dark elements
  
  // Dividers & Strokes
  border: '#E7EEFF',               // Subtle boundary stroke
  borderStrong: '#C6C6CD',         // Outline variant
  borderFocus: '#172033',
  
  // Status Colors
  danger: '#BA1A1A',               // Error
  dangerLight: '#FFDAD6',          // Error container
  success: '#416900',              // Success
  successLight: 'rgba(182, 241, 106, 0.3)', // Secondary container tint
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  
  // Payment Method Colors
  upi: '#4F46E5',
  cash: '#10B981',
  cardPayment: '#F97316',
  
  // Overlays
  overlay: 'rgba(1, 8, 26, 0.65)',
};

export const DarkColors = {
  // Brand & Accents
  primary: '#F8FAFC',
  primaryContainer: '#172033',
  onPrimary: '#01081A',
  onPrimaryContainer: '#7F879F',
  
  secondary: '#B6F16A',
  secondaryContainer: '#203A00',
  onSecondaryContainer: '#B6F16A',
  secondaryFixed: '#B9F46C',
  
  accent: '#B6F16A',
  accentDark: '#8DC743',
  
  // Surfaces & Backgrounds (Deep Navy)
  background: '#090E17',
  surface: '#090E17',
  surfaceContainerLowest: '#131B2B',
  surfaceContainerLow: '#172236',
  surfaceContainer: '#1C273C',
  surfaceContainerHigh: '#24324D',
  surfaceContainerHighest: '#2B3B59',
  
  card: '#131B2B',
  cardSubtle: '#1C273C',
  
  // Typography
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#090E17',
  
  // Dividers & Strokes
  border: '#233048',
  borderStrong: '#324463',
  borderFocus: '#B6F16A',
  
  // Status Colors
  danger: '#F87171',
  dangerLight: '#381616',
  success: '#4ADE80',
  successLight: '#0E2E1B',
  warning: '#FBBF24',
  warningLight: '#362B0E',
  info: '#60A5FA',
  infoLight: '#122543',
  
  // Payment Method Colors
  upi: '#818CF8',
  cash: '#34D399',
  cardPayment: '#FB923C',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.85)',
};

export type ColorTokens = typeof LightColors;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 24,
  xxl: 28,
  pill: 9999,
};

export const Typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  hero: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headline: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  currency: {
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums' as const],
  },
};

export const MinTouchTarget = 48;
