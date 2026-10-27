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
      return <Utensils size={size} color={color} />;
    case 'car':
      return <Car size={size} color={color} />;
    case 'shopping-cart':
      return <ShoppingCart size={size} color={color} />;
    case 'shopping-bag':
      return <ShoppingBag size={size} color={color} />;
    case 'zap':
      return <Zap size={size} color={color} />;
    case 'film':
      return <Film size={size} color={color} />;
    case 'heart':
      return <Heart size={size} color={color} />;
    case 'briefcase':
      return <Briefcase size={size} color={color} />;
    case 'trending-up':
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
        <Text style={[typography.headline, { color: colors.textPrimary }]}>
          Recent Activity
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(tabs)/activity')}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
            View All
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* List */}
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
            const iconColor = txn.categoryColor || (isIncome ? colors.success : colors.danger);

            return (
              <TouchableOpacity
                key={txn.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/modal/transaction-detail?id=${txn.id}`)}
                style={[
                  styles.txnItem,
                  {
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    borderBottomWidth: isLast ? 0 : 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                {/* Category Icon */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: `${iconColor}1A`,
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  {getCategoryIcon(txn.categoryIcon || 'receipt', iconColor)}
                </View>

                {/* Details */}
                <View style={styles.infoCol}>
                  <Text
                    style={[
                      typography.body,
                      { color: colors.textPrimary, fontWeight: '600' },
                    ]}
                    numberOfLines={1}
                  >
                    {txn.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {txn.categoryName || 'General'}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}> • </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: txn.paymentMethod === 'UPI' ? colors.upi : colors.textSecondary },
                      ]}
                    >
                      {txn.paymentMethod}
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      typography.body,
                      typography.currency,
                      {
                        color: isIncome ? colors.success : colors.textPrimary,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {isIncome ? `+${txn.amountFormatted}` : `-${txn.amountFormatted}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listCard: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
