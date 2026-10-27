import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MonthlyBudget } from '../../types';

interface BudgetCardProps {
  budget: MonthlyBudget;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const { colors, spacing, radii, typography } = useTheme();

  const isExceeded = budget.warningStatus === 'exceeded';
  const isCritical = budget.warningStatus === 'critical' || budget.warningStatus === 'warning';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primary,
          borderRadius: radii.card,
          padding: spacing.xl,
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isExceeded ? colors.danger : colors.accent },
            ]}
          >
            {isExceeded ? (
              <AlertCircle size={16} color={colors.textInverse} />
            ) : (
              <ShieldCheck size={16} color={colors.primary} />
            )}
          </View>
          <Text style={[typography.caption, { color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Safe Monthly Balance
          </Text>
        </View>

        <View
          style={[
            styles.percentagePill,
            {
              backgroundColor: isExceeded
                ? 'rgba(217, 92, 92, 0.2)'
                : 'rgba(184, 243, 107, 0.2)',
            },
          ]}
        >
          <Text
            style={[
              typography.caption,
              {
                color: isExceeded ? colors.danger : colors.accent,
                fontWeight: '700',
              },
            ]}
          >
            {budget.percentageUsed}% spent
          </Text>
        </View>
      </View>

      {/* Main Remaining Amount */}
      <View style={{ marginVertical: spacing.md }}>
        <Text
          style={[
            typography.display,
            typography.currency,
            { color: isExceeded ? colors.danger : colors.accent },
          ]}
        >
          {budget.remainingSafeFormatted}
        </Text>
        <Text style={[typography.bodySm, { color: '#94A3B8', marginTop: 2 }]}>
          Remaining of {budget.amountLimitFormatted} limit ({budget.daysRemaining} days left)
        </Text>
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarBg,
          { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: radii.pill },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: isExceeded ? colors.danger : colors.accent,
              width: `${Math.min(budget.percentageUsed, 100)}%`,
              borderRadius: radii.pill,
            },
          ]}
        />
      </View>

      {/* Footer Metrics */}
      <View style={[styles.footer, { marginTop: spacing.md }]}>
        <View>
          <Text style={[typography.caption, { color: '#64748B' }]}>Total Spent MTD</Text>
          <Text style={[typography.body, typography.currency, { color: '#F1F5F9' }]}>
            {budget.totalSpentFormatted}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[typography.caption, { color: '#64748B' }]}>Recommended Pace</Text>
          <Text
            style={[
              typography.body,
              typography.currency,
              { color: colors.accent, fontWeight: '700' },
            ]}
          >
            {budget.dailyAllowanceFormatted}/day
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentagePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
