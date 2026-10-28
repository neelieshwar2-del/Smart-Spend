import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ColorTokens, Spacing, Radii, Typography } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorTokens;
  spacing: typeof Spacing;
  radii: typeof Radii;
  typography: typeof Typography;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  colors: LightColors,
  spacing: Spacing,
  radii: Radii,
  typography: Typography,
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        colors,
        spacing: Spacing,
        radii: Radii,
        typography: Typography,
        setThemeMode: setMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);
