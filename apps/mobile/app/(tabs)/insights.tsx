import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Wallet,
  Calendar,
  Utensils,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useDashboard } from '../../src/hooks/useDashboard';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';
import { api } from '../../src/services/api';

export default function InsightsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { dashboard, isLoading, refetch } = useDashboard();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [recurringList, setRecurringList] = useState<any[]>([]);

  useEffect(() => {
    api.getRecurring()
      .then(items => {
        if (items) setRecurringList(items);
      })
      .catch(() => {});
  }, []);

  // Compute 7-day spending trend dynamically from recent transactions
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result: Array<{ day: string; amount: number; target: number }> = [];
    const dailyTargetRupees = (dashboard?.todaySpending?.dailyTarget || 120000) / 100;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().slice(0, 10);

      let dayTotalRupees = 0;
      if (dashboard?.recentTransactions) {
        for (const t of dashboard.recentTransactions) {
          if (t.type === 'expense' && t.transactionDate && t.transactionDate.startsWith(dateStr)) {
            dayTotalRupees += (t.amount || 0) / 100;
          }
        }
      }
      result.push({ day: dayName, amount: dayTotalRupees, target: dailyTargetRupees });
    }
    return result;
  }, [dashboard?.recentTransactions, dashboard?.todaySpending?.dailyTarget]);

  const maxBar = Math.max(1, ...weeklyData.map(d => d.amount));

  const topCat = dashboard?.topCategories?.[0] || {
    name: 'General',
    amountFormatted: '₹0.00',
    percentage: 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Period Selector Pill Tabs */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: 6 }}>
        <View style={[styles.periodBar, { backgroundColor: colors.surfaceContainer }]}>
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => {
            const isSelected = selectedPeriod === p;
            return (
              <TouchableOpacity
                key={p}
                activeOpacity={0.7}
                onPress={() => setSelectedPeriod(p)}
                style={[
                  styles.periodTab,
                  isSelected && { backgroundColor: colors.primary, borderRadius: 9999 },
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
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100, gap: 14 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* AI Smart Financial Delight Banner */}
        <View style={[styles.delightBanner, { backgroundColor: colors.secondaryContainer }]}>
          <View style={[styles.delightIconCircle, { backgroundColor: 'rgba(65, 105, 0, 0.15)' }]}>
            <Sparkles size={18} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[typography.caption, { color: colors.secondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                Smart Insight
              </Text>
              <View style={[styles.bannerDot, { backgroundColor: colors.secondary }]} />
            </View>
            <Text style={[typography.bodySm, { color: colors.onSecondaryContainer, fontWeight: '500', marginTop: 3, lineHeight: 18 }]}>
              {dashboard?.smartTip || 'Your spending patterns and category pace will update dynamically as transactions are recorded.'}
            </Text>
          </View>
        </View>

        {/* 2x2 Analytics Metric Grid */}
        <View style={styles.grid}>
          {/* Metric 1: Total Spent */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metricHeader}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Spent</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: colors.surfaceContainerLow }]}>
                <Wallet size={16} color={colors.primary} />
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={[typography.title, typography.currency, { color: colors.primary, fontWeight: '700' }]}>
                {dashboard?.summary.totalExpensesFormatted || '₹0'}
              </Text>
              <Text style={[typography.caption, { color: colors.secondary, marginTop: 4, fontWeight: '600' }]}>
                Current cycle
              </Text>
            </View>
          </View>

          {/* Metric 2: Daily Average */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metricHeader}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Daily Average</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: colors.surfaceContainerLow }]}>
                <Calendar size={16} color={colors.primary} />
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={[typography.title, typography.currency, { color: colors.primary, fontWeight: '700' }]}>
                {dashboard?.todaySpending.dailyTargetFormatted || '₹0'}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                Calculated daily
              </Text>
            </View>
          </View>

          {/* Metric 3: Top Category */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metricHeader}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Top Category</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(182, 241, 106, 0.4)' }]}>
                <Utensils size={16} color={colors.secondary} />
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={[typography.subtitle, { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
                {topCat.name}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {topCat.amountFormatted} ({topCat.percentage}%)
              </Text>
            </View>
          </View>

          {/* Metric 4: Safe to Spend */}
          <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.metricHeader}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>Safe to Spend</Text>
              <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(182, 241, 106, 0.3)' }]}>
                <ShieldCheck size={16} color={colors.secondary} />
              </View>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={[typography.title, typography.currency, { color: colors.secondary, fontWeight: '700' }]}>
                {dashboard?.todaySpending.bufferRemainingFormatted || '₹0'}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
                {dashboard?.monthlyBudget.daysRemaining || 0} days remaining
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Spending Trend Bar Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
            7-Day Spending Trend
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Daily spending compared to ₹1,200 baseline
          </Text>

          <View style={styles.barsContainer}>
            {weeklyData.map((d) => {
              const heightRatio = d.amount / (maxBar || 1);
              const isOver = d.amount > d.target;
              return (
                <View key={d.day} style={styles.barColumn}>
                  <View style={styles.barSlot}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(12, Math.min(heightRatio * 100, 100))}%`,
                          backgroundColor: isOver ? colors.danger : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
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

          {dashboard?.topCategories.map((cat: any) => (
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
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{recurringList.length} Active</Text>
          </View>

          {recurringList.length === 0 ? (
            <Text style={[typography.caption, { color: colors.textSecondary, paddingVertical: 8 }]}>
              No active recurring subscriptions found.
            </Text>
          ) : (
            recurringList.map((sub: any, idx: number, arr: any[]) => (
              <View
                key={sub.id}
                style={[
                  styles.subRow,
                  {
                    borderBottomWidth: idx === arr.length - 1 ? 0 : 1,
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
                  {sub.amountFormatted || `₹${(sub.amount / 100).toFixed(2)}`}/mo
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 9999,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delightBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    boxShadow: '0px 2px 6px rgba(68, 110, 0, 0.1)',
    elevation: 2,
  },
  delightIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: '0px 2px 6px rgba(23, 32, 51, 0.03)',
    elevation: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    boxShadow: '0px 2px 6px rgba(23, 32, 51, 0.03)',
    elevation: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barSlot: {
    flex: 1,
    width: 18,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
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
