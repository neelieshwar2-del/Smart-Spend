import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useDashboard } from '../../src/hooks/useDashboard';
import { BudgetCard } from '../../src/components/dashboard/BudgetCard';
import { TodayPacingCard } from '../../src/components/dashboard/TodayPacingCard';
import { QuickActions } from '../../src/components/dashboard/QuickActions';
import { RecentTransactions, getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { dashboard, isLoading, refetch } = useDashboard();

  if (!dashboard) {
    return <View style={[styles.center, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.sm,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase' }]}>
            October 2026
          </Text>
          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700' }]}>
            Hi, Rohan 👋
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/modal/notifications')}
          style={[
            styles.notifBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.pill,
            },
          ]}
        >
          <Bell size={20} color={colors.textPrimary} />
          <View style={[styles.notifDot, { backgroundColor: colors.danger }]} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Monthly Budget Card */}
        <BudgetCard budget={dashboard.monthlyBudget} />

        {/* Quick Action Buttons */}
        <View style={{ marginTop: spacing.lg }}>
          <QuickActions />
        </View>

        {/* Today's Spending Card */}
        <View style={{ marginTop: spacing.lg }}>
          <TodayPacingCard today={dashboard.todaySpending} />
        </View>

        {/* Data-Grounded AI Insight Tip */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/modal/ai-assistant')}
          style={[
            styles.smartTipCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.xl,
              padding: spacing.md,
              marginTop: spacing.lg,
            },
          ]}
        >
          <View style={styles.tipHeader}>
            <View style={[styles.tipIcon, { backgroundColor: 'rgba(184, 243, 107, 0.25)' }]}>
              <Sparkles size={16} color={colors.primary} />
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase' }]}>
              Smart Financial Copilot
            </Text>
          </View>
          <Text style={[typography.bodySm, { color: colors.textPrimary, marginTop: 6 }]}>
            {dashboard.smartTip}
          </Text>
        </TouchableOpacity>

        {/* Top Spending Categories Horizontal Carousel */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Top Spending Breakdown
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {dashboard.topCategories.map((cat) => (
              <View
                key={cat.name}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View
                    style={[
                      styles.catIconBox,
                      { backgroundColor: `${cat.color}1F`, borderRadius: radii.md },
                    ]}
                  >
                    {getCategoryIcon(cat.icon, cat.color, 16)}
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
                    {cat.name}
                  </Text>
                </View>
                <Text
                  style={[
                    typography.body,
                    typography.currency,
                    { color: colors.textPrimary, fontWeight: '700', marginTop: 8 },
                  ]}
                >
                  {cat.amountFormatted}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {cat.percentage}% of month
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Recent Transactions List */}
        <View style={{ marginTop: spacing.xl }}>
          <RecentTransactions transactions={dashboard.recentTransactions} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 10,
    right: 11,
  },
  scrollContent: {
    paddingTop: 12,
  },
  smartTipCard: {
    borderWidth: 1,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCard: {
    width: 140,
    borderWidth: 1,
  },
  catIconBox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
