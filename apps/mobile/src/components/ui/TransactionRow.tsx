import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { CategoryIcon } from './CategoryIcon';
import { CurrencyText } from './CurrencyText';
import { Transaction } from '../../types';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
  isLast?: boolean;
  style?: ViewStyle;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onPress,
  showDate = false,
  isLast = false,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.row,
        {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.border,
        },
        style,
      ]}
    >
      <CategoryIcon
        iconName={transaction.categoryIcon || 'receipt'}
        color={transaction.categoryColor || (isIncome ? colors.success : colors.danger)}
        containerSize={42}
        style={{ marginRight: 12 }}
      />

      <View style={styles.contentCol}>
        <Text
          style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}
          numberOfLines={1}
        >
          {transaction.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {transaction.categoryName || 'General'}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}> • </Text>
          <Text
            style={[
              typography.caption,
              { color: transaction.paymentMethod === 'UPI' ? colors.upi : colors.textSecondary },
            ]}
          >
            {transaction.paymentMethod}
          </Text>
          {showDate && (
            <>
              <Text style={[typography.caption, { color: colors.textMuted }]}> • </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {new Date(transaction.transactionDate).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </>
          )}
        </View>
      </View>

      <CurrencyText
        amount={transaction.amountFormatted}
        type={isIncome ? 'income' : 'expense'}
        showSign
        size="md"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCol: {
    flex: 1,
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});
