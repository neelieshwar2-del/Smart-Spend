import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'flat' | 'outline' | 'accent';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'elevated' }) => {
  const { colors, radii, spacing } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'flat':
        return colors.cardSubtle;
      case 'accent':
        return colors.accent;
      default:
        return colors.card;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return { borderWidth: 1, borderColor: colors.border };
    }
    return { borderWidth: 1, borderColor: colors.border };
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: radii.card,
          padding: spacing.lg,
          ...getBorder(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
