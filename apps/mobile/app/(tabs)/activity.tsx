import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  Download,
  Calendar,
  ArrowDown,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Tag,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useDashboard } from '../../src/hooks/useDashboard';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';
import { Transaction } from '../../src/types';

export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const { transactions, isLoading, refetch } = useTransactions({
    search: searchQuery,
    type: selectedFilter === 'income' ? 'income' : selectedFilter === 'expense' ? 'expense' : 'all',
  });
  const { dashboard } = useDashboard();

  // Additional client-side filters
  const filtered = transactions.filter((t: any) => {
    if (selectedFilter === 'upi' && t.paymentMethod !== 'UPI') return false;
    if (selectedFilter === 'high' && t.amount < 50000) return false;
    if (selectedFilter === 'food' && !t.categoryName?.toLowerCase().includes('food') && !t.categoryName?.toLowerCase().includes('dining')) return false;
    return true;
  });

  // Date Grouping Helper
  const groupTransactionsByDate = (txns: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    txns.forEach((txn) => {
      const txnDate = new Date(txn.transactionDate).toDateString();
      let label = txnDate;
      if (txnDate === today) label = 'Today';
      else if (txnDate === yesterday) label = 'Yesterday';

      if (!groups[label]) groups[label] = [];
      groups[label].push(txn);
    });

    return groups;
  };

  const grouped = groupTransactionsByDate(filtered);

  const handleExportCSV = () => {
    Alert.alert(
      'Export Statement',
      'Your October 2026 transaction ledger has been prepared for CSV download.',
      [{ text: 'OK' }]
    );
  };

  const burnPercent = dashboard?.monthlyBudget.percentageUsed || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Search Input Bar */}
      <View style={{ paddingHorizontal: spacing.lg, marginTop: 4 }}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14 },
          ]}
        >
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search merchants, categories, notes..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[typography.bodySm, { flex: 1, color: colors.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips Horizontal Carousel */}
      <View style={{ marginVertical: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}
        >
          {[
            { label: 'All Types', key: 'all' },
            { label: 'Food & Dining', key: 'food' },
            { label: 'UPI', key: 'upi' },
            { label: 'Amount > ₹500', key: 'high' },
            { label: 'Income Only', key: 'income' },
          ].map((chip) => {
            const isSelected = selectedFilter === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                activeOpacity={0.7}
                onPress={() => setSelectedFilter(chip.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                {isSelected && <Check size={14} color={colors.textInverse} style={{ marginRight: 4 }} />}
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isSelected ? colors.textInverse : colors.textPrimary,
                      fontWeight: '600',
                    },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100, gap: 14 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Monthly Snapshot Card */}
        <View style={[styles.snapshotCard, { backgroundColor: colors.primaryContainer }]}>
          <View style={styles.snapshotAmbientGlow} pointerEvents="none" />

          <View style={styles.snapshotHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} color={colors.secondaryContainer} />
              <Text style={[typography.title, { color: colors.onPrimary, fontWeight: '700' }]}>
                This Month
              </Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}>
              <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '600' }]}>
                {filtered.length} Transactions
              </Text>
            </View>
          </View>

          {/* 2 Column Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Text style={[typography.caption, { color: colors.onPrimaryContainer }]}>Total Spent</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text style={[typography.title, typography.currency, { color: colors.onPrimary, fontWeight: '700' }]}>
                  {dashboard?.summary.totalExpensesFormatted || '₹0'}
                </Text>
                <Text style={[typography.caption, { color: colors.secondaryContainer, fontWeight: '600' }]}>
                  Active
                </Text>
              </View>
            </View>

            <View style={[styles.statBox, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Text style={[typography.caption, { color: colors.onPrimaryContainer }]}>Income Earned</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text style={[typography.title, typography.currency, { color: colors.secondaryContainer, fontWeight: '700' }]}>
                  {dashboard?.summary.totalIncomeFormatted || '₹0'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ArrowDown size={12} color={colors.secondaryContainer} />
                  <Text style={[typography.caption, { color: colors.secondaryContainer, fontWeight: '600' }]}>
                    Safe
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Micro Progress Bar */}
          <View style={{ marginTop: 6, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[typography.caption, { color: colors.onPrimaryContainer }]}>Monthly Budget Burn</Text>
              <Text style={[typography.caption, { color: colors.onPrimary, fontWeight: '600' }]}>{burnPercent}%</Text>
            </View>
            <View style={[styles.burnTrack, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <View
                style={[
                  styles.burnFill,
                  {
                    backgroundColor: colors.secondaryContainer,
                    width: `${Math.min(burnPercent, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Action / CSV Link Row */}
        <View style={styles.csvRow}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Tap item for details & actions
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleExportCSV} style={styles.exportLink}>
            <Download size={14} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              Export CSV
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grouped Ledger List */}
        {Object.keys(grouped).length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
              No matching transactions found.
            </Text>
          </View>
        ) : (
          Object.keys(grouped).map((dateLabel) => (
            <View key={dateLabel} style={{ gap: 6 }}>
              <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 4 }]}>
                {dateLabel}
              </Text>

              <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {grouped[dateLabel].map((txn, idx) => {
                  const isIncome = txn.type === 'income';
                  const isLast = idx === grouped[dateLabel].length - 1;
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
                      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainer }]}>
                        {getCategoryIcon(txn.categoryIcon || 'receipt', iconColor, 18)}
                      </View>

                      <View style={styles.txnCenter}>
                        <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
                          {txn.merchant || txn.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          {txn.categoryName} • {txn.paymentMethod || 'UPI'}
                        </Text>
                      </View>

                      <View style={styles.txnRight}>
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
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {/* Footer Delight Pill */}
        <View style={styles.footerTipWrapper}>
          <View style={[styles.footerPill, { backgroundColor: colors.surfaceContainer }]}>
            <Sparkles size={14} color={colors.secondary} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              Record your daily transactions to stay within budget
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  snapshotCard: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  snapshotAmbientGlow: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(182, 241, 106, 0.1)',
  },
  snapshotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
  },
  burnTrack: {
    width: '100%',
    height: 6,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  burnFill: {
    height: '100%',
    borderRadius: 9999,
  },
  csvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  exportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  groupCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnCenter: {
    flex: 1,
    marginLeft: 12,
  },
  txnRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  footerTipWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
});
