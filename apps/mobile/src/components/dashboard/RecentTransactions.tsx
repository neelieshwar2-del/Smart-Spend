import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Utensils,
  Car,
  ShoppingCart,
  ShoppingBag,
  Zap,
  Film,
  Heart,
  Briefcase,
  TrendingUp,
  Receipt,
  ChevronRight,
  ArrowRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { Transaction } from '../../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const getCategoryIcon = (iconName: string, color: string, size = 18) => {
  switch (iconName?.toLowerCase()) {
    case 'utensils':
    case 'restaurant':
    case 'food':
      return <Utensils size={size} color={color} />;
    case 'car':
    case 'directions_car':
    case 'transport':
      return <Car size={size} color={color} />;
    case 'shopping-cart':
    case 'shopping_cart':
    case 'groceries':
      return <ShoppingCart size={size} color={color} />;
    case 'shopping-bag':
    case 'shopping_bag':
      return <ShoppingBag size={size} color={color} />;
    case 'zap':
    case 'bolt':
    case 'utilities':
      return <Zap size={size} color={color} />;
    case 'film':
    case 'movie':
    case 'entertainment':
      return <Film size={size} color={color} />;
    case 'heart':
    case 'health':
    case 'medical':
      return <Heart size={size} color={color} />;
    case 'briefcase':
    case 'work':
    case 'salary':
      return <Briefcase size={size} color={color} />;
    case 'trending-up':
    case 'investment':
      return <TrendingUp size={size} color={color} />;
    default:
      return <Receipt size={size} color={color} />;
  }
};

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const router = useRouter();
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
          Recent Transactions
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/activity')}
          style={styles.viewAllLink}
        >
          <Text style={[typography.subtitle, { color: colors.secondary, fontWeight: '600' }]}>
            View all
          </Text>
          <ChevronRight size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* List Card */}
      <View
        style={[
          styles.listCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radii.card,
          },
        ]}
      >
        {transactions.length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No transactions recorded yet.
            </Text>
          </View>
        ) : (
          transactions.slice(0, 5).map((txn, index) => {
            const isIncome = txn.type === 'income';
            const isLast = index === Math.min(transactions.length, 5) - 1;
            const iconColor = txn.categoryColor || (isIncome ? colors.secondary : colors.textPrimary);

            return (
              <TouchableOpacity
                key={txn.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/modal/transaction-detail?id=${txn.id}`)}
                style={[
                  styles.txnRow,
                  { padding: spacing.md },
                  !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainer }]}>
                  {getCategoryIcon(txn.categoryIcon || 'receipt', iconColor, 18)}
                </View>

                <View style={styles.txnDetails}>
                  <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
                    {txn.merchant || txn.title}
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                    {txn.categoryName} • {txn.formattedDate || 'Today'}
                  </Text>
                </View>

                <View style={styles.amountBox}>
                  <Text
                    style={[
                      typography.subtitle,
                      typography.currency,
                      {
                        color: isIncome ? colors.secondary : colors.textPrimary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {isIncome ? `+${txn.amountFormatted}` : `-${txn.amountFormatted}`}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    {txn.paymentMethod || 'UPI'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Bottom Quick Activity Pill Button */}
      <View style={styles.bottomLinkContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/activity')}
          style={[styles.bottomActivityBtn, { backgroundColor: colors.surfaceContainer }]}
        >
          <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '600' }]}>
            View all activity
          </Text>
          <ArrowRight size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  listCard: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnDetails: {
    flex: 1,
    marginLeft: 12,
  },
  amountBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  bottomLinkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  bottomActivityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
});
