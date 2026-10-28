import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Sliders, ShieldCheck, AlertCircle, Edit3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useDashboard } from '../../src/hooks/useDashboard';
import { BudgetProgressBar } from '../../src/components/ui/BudgetProgressBar';
import { CurrencyText } from '../../src/components/ui/CurrencyText';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

interface CategoryBudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  limit: number;
  spentFormatted: string;
  limitFormatted: string;
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
}

export default function BudgetsTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { dashboard, isLoading, refetch } = useDashboard();

  // Dynamic category limits derived from dashboard breakdown
  const categoryBudgets: CategoryBudgetItem[] = useMemo(() => {
    if (!dashboard?.topCategories || dashboard.topCategories.length === 0) {
      return [];
    }
    return dashboard.topCategories.map((cb: any, idx: number): CategoryBudgetItem => ({
      id: `cb_${idx}`,
      name: cb.name,
      icon: cb.icon,
      color: cb.color,
      spent: cb.amount,
      limit: cb.amount,
      spentFormatted: cb.amountFormatted,
      limitFormatted: cb.amountFormatted,
      percentage: cb.percentage,
      status: (cb.percentage > 85 ? 'critical' : cb.percentage > 60 ? 'warning' : 'safe') as 'safe' | 'warning' | 'critical',
    }));
  }, [dashboard?.topCategories]);

  const budget = dashboard?.monthlyBudget;

  const handleEditBudget = () => {
    Alert.alert(
      'Configure Monthly Budget',
      'Adjust your monthly spend limit and pacing algorithm threshold.',
      [
        { text: 'Set ₹50,000' },
        { text: 'Keep ₹45,000' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <View>
          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700' }]}>
            Budget Management
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            October 2026 Spending Limits
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleEditBudget}
          style={[
            styles.configBtn,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.pill },
          ]}
        >
          <Sliders size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
            Adjust
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Main Budget Card */}
        {budget && (
          <View
            style={[
              styles.mainBudgetCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radii.card,
                padding: spacing.xl,
              },
            ]}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
                <ShieldCheck size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.title, { color: colors.textPrimary }]}>
                  Monthly Overall Spend Limit
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {budget.daysRemaining} days remaining in billing cycle
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: colors.cardSubtle }]}>
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {budget.percentageUsed}% used
                </Text>
              </View>
            </View>

            {/* Balances */}
            <View style={{ marginVertical: spacing.lg }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Safe Remaining</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Spend Limit: {budget.amountLimitFormatted}</Text>
              </View>
              <CurrencyText
                amount={budget.remainingSafeFormatted}
                type="neutral"
                size="hero"
                color={colors.textPrimary}
                style={{ marginTop: 2 }}
              />
            </View>

            {/* Progress Bar */}
            <BudgetProgressBar percentage={budget.percentageUsed} status={budget.warningStatus} height={10} />

            {/* Metrics Footer */}
            <View style={[styles.metricsFooter, { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }]}>
              <View>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Total MTD Spent</Text>
                <Text style={[typography.body, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {budget.totalSpentFormatted}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>Safe Daily Pace</Text>
                <Text style={[typography.body, typography.currency, { color: colors.accentDark, fontWeight: '700' }]}>
                  {budget.dailyAllowanceFormatted}/day
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Category Specific Budgets */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={[typography.title, { color: colors.textPrimary }]}>
              Category Limits
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/modal/add-transaction')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Plus size={16} color={colors.accentDark} />
              <Text style={[typography.caption, { color: colors.accentDark, fontWeight: '700' }]}>
                Add Category Limit
              </Text>
            </TouchableOpacity>
          </View>

          {categoryBudgets.length === 0 ? (
            <View
              style={[
                styles.categoryBudgetCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  padding: spacing.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
                No category spending logged yet.
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>
                Add transactions to see automated category-wise budget tracking.
              </Text>
            </View>
          ) : (
            categoryBudgets.map((cb: CategoryBudgetItem) => (
              <View
                key={cb.id}
                style={[
                  styles.categoryBudgetCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.catIconWrap, { backgroundColor: `${cb.color}1F` }]}>
                      {getCategoryIcon(cb.icon, cb.color, 16)}
                    </View>
                    <View>
                      <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                        {cb.name}
                      </Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>
                        Limit: {cb.limitFormatted}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.bodySm, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {cb.spentFormatted}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {cb.percentage}% used
                    </Text>
                  </View>
                </View>

                <BudgetProgressBar percentage={cb.percentage} status={cb.status} height={6} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  mainBudgetCard: {
    borderWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metricsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBudgetCard: {
    borderWidth: 1,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
