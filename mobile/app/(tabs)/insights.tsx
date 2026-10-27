import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingDown, TrendingUp, Sparkles, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useDashboard } from '../../src/hooks/useDashboard';
import { INITIAL_RECURRING } from '../../src/services/mockData';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { dashboard, isLoading, refetch } = useDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // 7-day spending trends mock
  const weeklyData = [
    { day: 'Mon', amount: 840, target: 1200 },
    { day: 'Tue', amount: 1450, target: 1200 },
    { day: 'Wed', amount: 620, target: 1200 },
    { day: 'Thu', amount: 1890, target: 1200 },
    { day: 'Fri', amount: 2400, target: 1200 },
    { day: 'Sat', amount: 1100, target: 1200 },
    { day: 'Sun', amount: 450, target: 1200 },
  ];
  const maxBar = Math.max(...weeklyData.map(d => d.amount));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <View>
          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700' }]}>
            Spending Analytics
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Grounded behavioral trends and forecasting
          </Text>
        </View>
      </View>

      {/* Period Tabs */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.sm }}>
        <View style={[styles.periodSwitcher, { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.pill }]}>
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => {
            const isSelected = selectedPeriod === p;
            return (
              <TouchableOpacity
                key={p}
                activeOpacity={0.7}
                onPress={() => setSelectedPeriod(p)}
                style={[
                  styles.periodTab,
                  isSelected && { backgroundColor: colors.primary, borderRadius: radii.pill },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? colors.textInverse : colors.textSecondary,
                      fontWeight: '700',
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* 2x2 Analytics Metric Grid */}
        <View style={styles.grid}>
          {/* Total Spent */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.lg }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Spent</Text>
            <Text style={[typography.title, typography.currency, { color: colors.textPrimary, marginVertical: 4 }]}>
              {dashboard?.summary.totalExpensesFormatted || '₹28,450.00'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp size={12} color={colors.danger} />
              <Text style={[typography.caption, { color: colors.danger, marginLeft: 4, fontWeight: '600' }]}>
                +8% vs last month
              </Text>
            </View>
          </View>

          {/* Daily Average */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.lg }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Daily Average</Text>
            <Text style={[typography.title, typography.currency, { color: colors.textPrimary, marginVertical: 4 }]}>
              ₹917.00
            </Text>
            <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
              Under daily budget
            </Text>
          </View>

          {/* Top Category */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.lg }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Top Category</Text>
            <Text style={[typography.title, { color: colors.textPrimary, marginVertical: 4 }]} numberOfLines={1}>
              {dashboard?.topCategories[0]?.name || 'Food & Dining'}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {dashboard?.topCategories[0]?.percentage || 39}% of total spend
            </Text>
          </View>

          {/* Net Cash Flow */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.lg }]}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Net Savings</Text>
            <Text style={[typography.title, typography.currency, { color: colors.success, marginVertical: 4 }]}>
              {dashboard?.summary.netCashFlowFormatted || '+₹56,550.00'}
            </Text>
            <Text style={[typography.caption, { color: colors.success, fontWeight: '600' }]}>
              66% savings rate
            </Text>
          </View>
        </View>

        {/* Weekly Spending Trend Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card, marginTop: spacing.lg }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[typography.title, { color: colors.textPrimary }]}>Weekly Spending Pace</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Daily totals vs ₹1,200 daily target</Text>
            </View>
            <View style={[styles.targetPill, { backgroundColor: colors.cardSubtle }]}>
              <View style={[styles.targetDot, { backgroundColor: colors.accentDark }]} />
              <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>Target line</Text>
            </View>
          </View>

          {/* Bar Chart Visualization */}
          <View style={styles.barsContainer}>
            {weeklyData.map((d) => {
              const heightPercent = (d.amount / maxBar) * 100;
              const isOver = d.amount > d.target;
              return (
                <View key={d.day} style={styles.barCol}>
                  <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10, marginBottom: 4 }]}>
                    ₹{d.amount}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.cardSubtle }]}>
                    <View
                      style={[
                        styles.barBar,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: isOver ? colors.danger : colors.accent,
                          borderRadius: radii.sm,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600', marginTop: 6 }]}>
                    {d.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Breakdown Progress */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card, marginTop: spacing.lg }]}>
          <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.md }]}>
            Category Allocations
          </Text>

          {dashboard?.topCategories.map((cat) => (
            <View key={cat.name} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {getCategoryIcon(cat.icon, cat.color, 14)}
                  <Text style={[typography.bodySm, { color: colors.textPrimary, fontWeight: '600' }]}>
                    {cat.name}
                  </Text>
                </View>
                <Text style={[typography.bodySm, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {cat.amountFormatted} ({cat.percentage}%)
                </Text>
              </View>

              <View style={[styles.catBarTrack, { backgroundColor: colors.cardSubtle, borderRadius: radii.pill }]}>
                <View
                  style={[
                    styles.catBarFill,
                    { width: `${cat.percentage}%`, backgroundColor: cat.color, borderRadius: radii.pill },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Subscriptions */}
        <View style={[styles.subsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card, marginTop: spacing.lg }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color={colors.textPrimary} />
              <Text style={[typography.title, { color: colors.textPrimary }]}>Recurring Autopays</Text>
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>3 Active</Text>
          </View>

          {INITIAL_RECURRING.map((sub, idx) => (
            <View
              key={sub.id}
              style={[
                styles.subRow,
                {
                  borderBottomWidth: idx === INITIAL_RECURRING.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>{sub.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Due: {sub.nextDueDate}</Text>
              </View>
              <Text style={[typography.body, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                {sub.amountFormatted}/mo
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodSwitcher: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderWidth: 1,
  },
  chartCard: {
    padding: 16,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  targetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  targetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 90,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barBar: {
    width: '100%',
  },
  breakdownCard: {
    padding: 16,
    borderWidth: 1,
  },
  catBarTrack: {
    height: 6,
    width: '100%',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
  },
  subsCard: {
    padding: 16,
    borderWidth: 1,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
