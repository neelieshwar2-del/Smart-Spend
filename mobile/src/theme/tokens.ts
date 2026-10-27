/**
 * SmartSpend — Design Tokens & Theme Specification
 * Implements Section 5 Android UI/UX Specifications
 */

export const LightColors = {
  // Brand & Accents
  primary: '#172033',        // Deep midnight slate
  accent: '#B8F36B',         // Vibrant neo-lime
  accentDark: '#8DC743',     // Darker lime for active states
  
  // Surfaces & Backgrounds
  background: '#F7F8F5',     // Off-white alabaster primary canvas
  card: '#FFFFFF',           // Pure white card surfaces
  cardSubtle: '#F1F3EE',     // Subtle contrast card surface
  
  // Typography
  textPrimary: '#172033',    // High-contrast primary text
  textSecondary: '#737B8C',  // Calm slate gray supporting text
  textMuted: '#9DA4B2',      // Tertiary placeholder text
  textInverse: '#FFFFFF',    // White text on dark elements
  
  // Dividers & Strokes
  border: '#E7EAE3',         // Subtle boundary stroke
  borderFocus: '#172033',    // Active boundary stroke
  
  // Status Colors
  danger: '#D95C5C',         // Expense warning / budget critical
  dangerLight: '#FDF2F2',    // Danger pill background
  success: '#267548',        // Positive status / Income / On track
  successLight: '#EDF7F1',   // Success pill background
  warning: '#F59E0B',        // Caution / Pacing alert
  warningLight: '#FEF3C7',   // Warning pill background
  info: '#3B82F6',           // Information
  infoLight: '#EFF6FF',      // Info pill background
  
  // Payment Method Colors
  upi: '#4F46E5',            // UPI Purple/Indigo
  cash: '#10B981',           // Cash Emerald
  cardPayment: '#F97316',    // Card Amber/Orange
  
  // Overlays
  overlay: 'rgba(15, 23, 42, 0.65)',
};

export const DarkColors = {
  // Brand & Accents
  primary: '#F8FAFC',
  accent: '#B8F36B',
  accentDark: '#8DC743',
  
  // Surfaces & Backgrounds (Deep Navy)
  background: '#090E17',
  card: '#131B2B',
  cardSubtle: '#1C273C',
  
  // Typography
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#090E17',
  
  // Dividers & Strokes
  border: '#233048',
  borderFocus: '#B8F36B',
  
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
  card: 22,
  xxl: 28,
  pill: 9999,
};

export const Typography = {
  display: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
  },
  hero: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  headline: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
  currency: {
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums' as const],
  },
};

export const MinTouchTarget = 48;
