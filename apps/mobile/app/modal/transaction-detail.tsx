import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Trash2, Calendar, CreditCard, Tag, FileText } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { useTransactions } from '../../src/hooks/useTransactions';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function TransactionDetailModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions, deleteTransaction, isDeleting } = useTransactions();

  const txn = transactions.find((t) => t.id === id);

  if (!txn) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Transaction not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isIncome = txn.type === 'income';
  const iconColor = txn.categoryColor || (isIncome ? colors.success : colors.danger);

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${txn.title}"? This will immediately recalculate your remaining budget.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(txn.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Transaction Details</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20 }}>
        {/* Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.card,
              padding: spacing.xl,
            },
          ]}
        >
          <View style={[styles.iconBox, { backgroundColor: `${iconColor}1F`, borderRadius: radii.xl }]}>
            {getCategoryIcon(txn.categoryIcon || 'receipt', iconColor, 28)}
          </View>

          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700', marginTop: 12 }]}>
            {txn.title}
          </Text>

          {txn.merchant && (
            <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
              {txn.merchant}
            </Text>
          )}

          <Text
            style={[
              typography.display,
              typography.currency,
              {
                color: isIncome ? colors.success : colors.textPrimary,
                fontWeight: '700',
                marginTop: 10,
              },
            ]}
          >
            {isIncome ? `+${txn.amountFormatted}` : `-${txn.amountFormatted}`}
          </Text>
        </View>

        {/* Breakdown Attributes */}
        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.card,
              marginTop: spacing.lg,
            },
          ]}
        >
          {/* Category */}
          <View style={[styles.detailRow, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Tag size={18} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textSecondary }]}>Category</Text>
            </View>
            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
              {txn.categoryName || 'General'}
            </Text>
          </View>

          {/* Payment Method */}
          <View style={[styles.detailRow, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <CreditCard size={18} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textSecondary }]}>Payment Method</Text>
            </View>
            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
              {txn.paymentMethod}
            </Text>
          </View>

          {/* Date & Time */}
          <View style={[styles.detailRow, { padding: spacing.md, borderBottomWidth: txn.note ? 1 : 0, borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Calendar size={18} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textSecondary }]}>Date & Time</Text>
            </View>
            <Text style={[typography.bodySm, { color: colors.textPrimary, fontWeight: '600' }]}>
              {new Date(txn.transactionDate).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          </View>

          {/* Note */}
          {txn.note && (
            <View style={[styles.detailRow, { padding: spacing.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <FileText size={18} color={colors.textSecondary} />
                <Text style={[typography.body, { color: colors.textSecondary }]}>Note</Text>
              </View>
              <Text style={[typography.bodySm, { color: colors.textPrimary, maxWidth: '60%', textAlign: 'right' }]}>
                {txn.note}
              </Text>
            </View>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDelete}
          disabled={isDeleting}
          style={[
            styles.deleteBtn,
            {
              backgroundColor: colors.dangerLight,
              borderColor: colors.danger,
              borderRadius: radii.xl,
              marginTop: spacing.xl,
              padding: spacing.md,
            },
          ]}
        >
          <Trash2 size={18} color={colors.danger} style={{ marginRight: 8 }} />
          <Text style={[typography.body, { color: colors.danger, fontWeight: '700' }]}>
            Delete Transaction
          </Text>
        </TouchableOpacity>
      </View>
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroCard: {
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
