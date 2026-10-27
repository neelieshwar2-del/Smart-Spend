import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MonthlyBudget } from '../../types';

interface BudgetCardProps {
  budget: MonthlyBudget;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const { colors, spacing, radii, typography } = useTheme();

  const isExceeded = budget.warningStatus === 'exceeded';
  const percentLeft = Math.max(0, 100 - budget.percentageUsed);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.primaryContainer,
          borderRadius: radii.card,
          padding: spacing.lg,
        },
      ]}
    >
      {/* Ambient subtle glow decoration */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      <View style={{ zIndex: 1, gap: 14 }}>
        {/* Header Row: Label & Days Remaining */}
        <View style={styles.headerRow}>
          <Text style={[typography.subtitle, { color: colors.onPrimaryContainer, fontWeight: '500', letterSpacing: 0.3 }]}>
            Monthly Spend Limit
          </Text>

          <View style={styles.daysBadge}>
            <View style={[styles.pulseDot, { backgroundColor: isExceeded ? colors.danger : colors.secondaryContainer }]} />
            <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '600' }]}>
              {budget.daysRemaining} days remaining
            </Text>
          </View>
        </View>

        {/* Main Balance Display */}
        <View>
          <View style={styles.balanceRow}>
            <Text
              style={[
                typography.display,
                typography.currency,
                { color: colors.onPrimary, fontWeight: '700' },
              ]}
            >
              {budget.remainingSafeFormatted}
            </Text>

            <View
              style={[
                styles.percentPill,
                {
                  backgroundColor: isExceeded ? 'rgba(186, 26, 26, 0.25)' : 'rgba(182, 241, 106, 0.2)',
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: isExceeded ? '#FFB4AB' : colors.secondaryContainer,
                    fontWeight: '700',
                  },
                ]}
              >
                {isExceeded ? 'Exceeded' : `${percentLeft}% left`}
              </Text>
            </View>
          </View>
          <Text style={[typography.bodySm, { color: colors.onPrimaryContainer, marginTop: 4 }]}>
            Remaining safe balance to spend
          </Text>
        </View>

        {/* Custom Progress Bar */}
        <View style={{ gap: 6 }}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: isExceeded ? colors.danger : colors.secondaryContainer,
                  width: `${Math.min(budget.percentageUsed, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={[typography.caption, { color: colors.onPrimaryContainer }]}>
              Spent: <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>{budget.amountSpentFormatted}</Text>
            </Text>
            <Text style={[typography.caption, { color: colors.onPrimaryContainer }]}>
              Target: <Text style={{ color: colors.onPrimary, fontWeight: '600' }}>{budget.amountLimitFormatted}</Text> • <Text style={{ color: colors.secondaryContainer }}>{budget.dailyAllowanceFormatted}/day</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  ambientGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(182, 241, 106, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  percentPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 9999,
    overflow: 'hidden',
    padding: 1.5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
