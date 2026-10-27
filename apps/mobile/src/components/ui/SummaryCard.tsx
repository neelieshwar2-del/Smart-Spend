import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { CurrencyText } from './CurrencyText';

interface SummaryCardProps {
  title: string;
  amount: number | string;
  subtitle?: string;
  trendText?: string;
  isPositiveTrend?: boolean;
  type?: 'expense' | 'income' | 'neutral';
  style?: ViewStyle;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  amount,
  subtitle,
  trendText,
  isPositiveTrend,
  type = 'neutral',
  style,
}) => {
  const { colors, radii, spacing, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: spacing.md,
        },
        style,
      ]}
    >
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{title}</Text>

      <CurrencyText
        amount={amount}
        type={type}
        size="lg"
        style={{ marginVertical: 4 }}
      />

      {trendText && (
        <Text
          style={[
            typography.caption,
            {
              color: isPositiveTrend ? colors.success : colors.danger,
              fontWeight: '600',
            },
          ]}
        >
          {trendText}
        </Text>
      )}

      {subtitle && (
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
