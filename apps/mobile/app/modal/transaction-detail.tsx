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
import { X, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { useTransactions } from '../../src/hooks/useTransactions';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function TransactionDetailModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions, deleteTransaction, isDeleting } = useTransactions();

  const txn = transactions.find((t: any) => t.id === id);

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
  const iconColor = txn.categoryColor || (isIncome ? colors.secondary : colors.textPrimary);

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
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }]}>
        <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
          Transaction Details
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceContainer }]}
        >
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20, gap: 16 }}>
        {/* Detail Card Body */}
        <View style={styles.centerBody}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainer }]}>
            {getCategoryIcon(txn.categoryIcon || 'receipt', iconColor, 26)}
          </View>

          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700', marginTop: 10 }]}>
            {txn.merchant || txn.title}
          </Text>

          <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
            {txn.categoryName}
          </Text>

          <Text
            style={[
              typography.display,
              typography.currency,
              {
                color: isIncome ? colors.secondary : colors.textPrimary,
                fontWeight: '700',
                marginTop: 8,
              },
            ]}
          >
            {isIncome ? `+${txn.amountFormatted}` : `-${txn.amountFormatted}`}
          </Text>
        </View>

        {/* Key-Value Tiles (2x2 Grid) */}
        <View style={[styles.tilesContainer, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={styles.tileCol}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Timestamp</Text>
            <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '600', marginTop: 2 }]}>
              {txn.formattedDate || 'Today'}
            </Text>
          </View>

          <View style={styles.tileCol}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Payment Method</Text>
            <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '600', marginTop: 2 }]}>
              {txn.paymentMethod || 'UPI'}
            </Text>
          </View>

          <View style={styles.tileCol}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <CheckCircle2 size={16} color={colors.secondary} />
              <Text style={[typography.subtitle, { color: colors.secondary, fontWeight: '600' }]}>
                Settled
              </Text>
            </View>
          </View>

          <View style={styles.tileCol}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Tag / Notes</Text>
            <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '500', marginTop: 2 }]} numberOfLines={1}>
              {txn.note || '--'}
            </Text>
          </View>
        </View>

        {/* Delete Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDelete}
          disabled={isDeleting}
          style={[styles.deleteBtn, { backgroundColor: colors.dangerLight }]}
        >
          <Trash2 size={18} color={colors.danger} />
          <Text style={[typography.subtitle, { color: colors.danger, fontWeight: '600' }]}>
            Delete Transaction
          </Text>
        </TouchableOpacity>

        {/* Done Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.back()}
          style={[styles.doneBtn, { backgroundColor: colors.secondaryContainer }]}
        >
          <Text style={[typography.subtitle, { color: colors.primary, fontWeight: '700' }]}>
            Done
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBody: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    borderRadius: 18,
    gap: 16,
  },
  tileCol: {
    width: '45%',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 9999,
    gap: 8,
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 9999,
    shadowColor: '#446E00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
