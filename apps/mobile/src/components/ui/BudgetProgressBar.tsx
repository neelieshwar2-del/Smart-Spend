import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface BudgetProgressBarProps {
  percentage: number;
  status?: 'safe' | 'warning' | 'critical' | 'exceeded';
  height?: number;
  style?: ViewStyle;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  percentage,
  status = 'safe',
  height = 8,
  style,
}) => {
  const { colors, radii } = useTheme();

  const getBarColor = () => {
    switch (status) {
      case 'exceeded':
      case 'critical':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'safe':
      default:
        return colors.accent;
    }
  };

  const clampedWidth = Math.min(Math.max(percentage, 0), 100);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.cardSubtle,
          borderRadius: radii.pill,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedWidth}%`,
            backgroundColor: getBarColor(),
            borderRadius: radii.pill,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
