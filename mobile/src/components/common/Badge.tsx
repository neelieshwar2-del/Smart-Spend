import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface BadgeProps {
  label: string;
  variant?: 'safe' | 'warning' | 'danger' | 'accent' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', size = 'sm', style }) => {
  const { colors, radii, spacing, typography } = useTheme();

  const getVariantStyles = (): { bg: string; text: string } => {
    switch (variant) {
      case 'safe':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'accent':
        return { bg: colors.accent, text: colors.primary };
      case 'info':
        return { bg: colors.infoLight, text: colors.info };
      default:
        return { bg: colors.cardSubtle, text: colors.textSecondary };
    }
  };

  const { bg, text } = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderRadius: radii.pill,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
          paddingVertical: size === 'sm' ? 3 : 6,
        },
        style,
      ]}
    >
      <Text
        style={[
          size === 'sm' ? typography.caption : typography.bodySm,
          { color: text, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
