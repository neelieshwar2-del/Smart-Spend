import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { TodaySpending } from '../../types';

interface TodayPacingCardProps {
  today: TodaySpending;
}

export const TodayPacingCard: React.FC<TodayPacingCardProps> = ({ today }) => {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radii.card,
          padding: spacing.lg,
        },
      ]}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainer }]}>
            <Calendar size={16} color={colors.textPrimary} />
          </View>
          <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
            Today's Spending
          </Text>
        </View>

        <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '500' }]}>
          Daily Target {today.dailyTargetFormatted}
        </Text>
      </View>

      {/* Main Amounts Row */}
      <View style={styles.amountRow}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={[typography.hero, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
            {today.todaySpentFormatted}
          </Text>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            spent today
          </Text>
        </View>

        <View
          style={[
            styles.percentBadge,
            {
              backgroundColor: today.onTrack ? 'rgba(182, 241, 106, 0.3)' : colors.dangerLight,
            },
          ]}
        >
          <Text
            style={[
              typography.caption,
              {
                color: today.onTrack ? colors.secondary : colors.danger,
                fontWeight: '700',
              },
            ]}
          >
            {today.percentageOfAllowance}% of allowance
          </Text>
        </View>
      </View>

      {/* Segmented / Daily Visual Gauge */}
      <View style={{ gap: 8, marginTop: 4 }}>
        <View style={[styles.gaugeTrack, { backgroundColor: colors.surfaceContainer }]}>
          <View
            style={[
              styles.gaugeFill,
              {
                backgroundColor: today.onTrack ? colors.primary : colors.danger,
                width: `${Math.min(today.percentageOfAllowance, 100)}%`,
              },
            ]}
          />
        </View>

        <View style={styles.bufferRow}>
          {today.onTrack ? (
            <CheckCircle2 size={16} color={colors.secondary} />
          ) : (
            <AlertTriangle size={16} color={colors.danger} />
          )}
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '500' }]}>
            {today.bufferRemainingFormatted} safe buffer remaining
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    gap: 12,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 2,
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  gaugeTrack: {
    width: '100%',
    height: 8,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 9999,
  },
  bufferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
