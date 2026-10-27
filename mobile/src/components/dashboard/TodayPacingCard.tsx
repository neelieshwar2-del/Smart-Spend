import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, CheckCircle2, AlertTriangle } from 'lucide-react-native';
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
      {/* Title & Status */}
      <View style={styles.row}>
        <View style={styles.badgeRow}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={[typography.subtitle, { color: colors.textPrimary }]}>
            Today's Spending
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: today.onTrack ? colors.successLight : colors.warningLight,
            },
          ]}
        >
          {today.onTrack ? (
            <CheckCircle2 size={12} color={colors.success} style={{ marginRight: 4 }} />
          ) : (
            <AlertTriangle size={12} color={colors.warning} style={{ marginRight: 4 }} />
          )}
          <Text
            style={[
              typography.caption,
              { color: today.onTrack ? colors.success : colors.warning, fontWeight: '700' },
            ]}
          >
            {today.onTrack ? 'On Track' : 'Over Pace'}
          </Text>
        </View>
      </View>

      {/* Main Amounts */}
      <View style={{ marginVertical: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={[typography.hero, typography.currency, { color: colors.textPrimary }]}>
            {today.todaySpentFormatted}
          </Text>
          <Text style={[typography.body, typography.currency, { color: colors.textSecondary, marginLeft: 6 }]}>
            / {today.dailyTargetFormatted} target
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {today.bufferRemainingFormatted} remaining allowance today
        </Text>
      </View>

      {/* Pacing Bar */}
      <View
        style={[
          styles.barBg,
          { backgroundColor: colors.cardSubtle, borderRadius: radii.pill },
        ]}
      >
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: today.onTrack ? colors.accentDark : colors.warning,
              width: `${Math.min(today.percentageOfAllowance, 100)}%`,
              borderRadius: radii.pill,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  barBg: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
