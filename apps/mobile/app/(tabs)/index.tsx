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
import { useAuth } from '../../src/hooks/useAuth';
import { BudgetCard } from '../../src/components/dashboard/BudgetCard';
import { TodayPacingCard } from '../../src/components/dashboard/TodayPacingCard';
import { QuickActions } from '../../src/components/dashboard/QuickActions';
import { RecentTransactions, getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { dashboard, isLoading, refetch } = useDashboard();
  const { user } = useAuth();

  if (!dashboard) {
    return <View style={[styles.center, { backgroundColor: colors.background }]} />;
  }

  const displayName = user?.name ? user.name.split(' ')[0] : 'Rohan';

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
        <View style={{ flex: 1 }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }]}>
            Today
          </Text>
          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700' }]}>
            Welcome 👋
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/modal/notifications')}
          style={[
            styles.notifBtn,
            {
              backgroundColor: colors.surfaceContainer,
            },
          ]}
        >
          <Bell size={20} color={colors.textPrimary} />
          <View style={[styles.notifDot, { backgroundColor: colors.secondaryContainer }]} />
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
        {/* Monthly Spend Limit Hero Card */}
        <BudgetCard budget={dashboard.monthlyBudget} />

        {/* Quick Action Buttons (4 Grid) */}
        <View style={{ marginTop: spacing.md }}>
          <QuickActions />
        </View>

        {/* Today's Spending Card */}
        <View style={{ marginTop: spacing.md }}>
          <TodayPacingCard today={dashboard.todaySpending} />
        </View>

        {/* Smart Spend Tip Card */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/modal/ai-assistant')}
          style={[
            styles.smartTipCard,
            {
              backgroundColor: 'rgba(182, 241, 106, 0.2)',
              borderRadius: 16,
              padding: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={[styles.tipIconBox, { backgroundColor: colors.secondaryContainer }]}>
            <Sparkles size={16} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.secondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
              Smart Spend Tip
            </Text>
            <Text style={[typography.bodySm, { color: colors.textPrimary, fontWeight: '500', marginTop: 4, lineHeight: 18 }]}>
              {dashboard.smartTip || 'Log your expenses to receive personalized AI budget insights and spending pace analysis.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Top Spending Categories Horizontal Carousel */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Top Spending Breakdown
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {dashboard.topCategories.map((cat: any) => (
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
        <View style={{ marginTop: spacing.lg }}>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 9,
    right: 9,
    borderWidth: 1.5,
    borderColor: '#F9F9FF',
  },
  scrollContent: {
    paddingTop: 8,
  },
  smartTipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
