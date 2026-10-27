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
import { Search, Download, Filter, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useTransactions } from '../../src/hooks/useTransactions';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';
import { Transaction } from '../../src/types';

export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');

  const { transactions, isLoading, refetch } = useTransactions({
    search: searchQuery,
    type: selectedType,
  });

  // Filter client-side by payment method if needed
  const filtered = transactions.filter(t => {
    if (selectedMethod !== 'all' && t.paymentMethod !== selectedMethod) return false;
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <View>
          <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700' }]}>
            Activity & Ledger
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {filtered.length} transactions recorded
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleExportCSV}
          style={[
            styles.exportBtn,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.pill },
          ]}
        >
          <Download size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
            Export
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={{ paddingHorizontal: spacing.lg, marginVertical: spacing.xs }}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.md },
          ]}
        >
          <Search size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search merchants, notes, tags..."
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

      {/* Filter Chips Carousel */}
      <View style={{ marginVertical: spacing.sm }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: 8 }}>
          {[
            { label: 'All Types', key: 'all' },
            { label: 'Expenses Only', key: 'expense' },
            { label: 'Income Only', key: 'income' },
          ].map((tab) => {
            const isSelected = selectedType === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => setSelectedType(tab.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: isSelected ? colors.textInverse : colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {['UPI', 'Cash', 'Credit Card'].map((pm) => {
            const isSelected = selectedMethod === pm;
            return (
              <TouchableOpacity
                key={pm}
                activeOpacity={0.7}
                onPress={() => setSelectedMethod(selectedMethod === pm ? 'all' : pm)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.accent : colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: isSelected ? colors.primary : colors.textSecondary, fontWeight: '700' },
                  ]}
                >
                  {pm}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grouped Ledger List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {Object.keys(grouped).length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card }]}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              No matching transactions found.
            </Text>
          </View>
        ) : (
          Object.keys(grouped).map((dateLabel) => (
            <View key={dateLabel} style={{ marginTop: spacing.md }}>
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
                ]}
              >
                {dateLabel}
              </Text>

              <View
                style={[
                  styles.groupCard,
                  { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card },
                ]}
              >
                {grouped[dateLabel].map((txn, index) => {
                  const isIncome = txn.type === 'income';
                  const isLast = index === grouped[dateLabel].length - 1;
                  const iconColor = txn.categoryColor || (isIncome ? colors.success : colors.danger);

                  return (
                    <TouchableOpacity
                      key={txn.id}
                      activeOpacity={0.7}
                      onPress={() => router.push(`/modal/transaction-detail?id=${txn.id}`)}
                      style={[
                        styles.itemRow,
                        {
                          padding: spacing.md,
                          borderBottomWidth: isLast ? 0 : 1,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.iconBox, { backgroundColor: `${iconColor}1F`, borderRadius: radii.md }]}>
                        {getCategoryIcon(txn.categoryIcon || 'receipt', iconColor)}
                      </View>

                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>
                          {txn.title}
                        </Text>
                        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                          {txn.categoryName || 'General'} • {txn.paymentMethod}
                        </Text>
                      </View>

                      <Text
                        style={[
                          typography.body,
                          typography.currency,
                          { color: isIncome ? colors.success : colors.textPrimary, fontWeight: '700' },
                        ]}
                      >
                        {isIncome ? `+${txn.amountFormatted}` : `-${txn.amountFormatted}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
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
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  groupCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 20,
  },
});
