import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Check,
  Store,
  FileText,
  ShieldCheck,
  Zap,
  Wallet,
  Banknote,
  CreditCard,
  X,
  BadgeCheck,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Keypad } from '../../src/components/common/Keypad';
import { useTransactions } from '../../src/hooks/useTransactions';
import { TransactionType, PaymentMethod, Category, DEFAULT_CATEGORIES } from '../../src/types';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function AddTransactionModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { createTransaction, isCreating } = useTransactions();

  // State
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [selectedCatId, setSelectedCatId] = useState<string>(DEFAULT_CATEGORIES[0].id);
  const [merchant, setMerchant] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Keypad Actions
  const handleKeyPress = (key: string) => {
    if (key === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr((prev: string) => prev + '.');
      return;
    }

    if (amountStr === '0') {
      setAmountStr(key);
      return;
    }

    // Limit to 2 decimal places
    if (amountStr.includes('.')) {
      const parts = amountStr.split('.');
      if (parts[1]?.length >= 2) return;
    }

    setAmountStr((prev: string) => prev + key);
  };

  const handleBackspace = () => {
    if (amountStr.length <= 1) {
      setAmountStr('0');
      return;
    }
    setAmountStr((prev: string) => prev.slice(0, -1));
  };

  const handlePresetAdd = (amt: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(Math.round(current + amt)));
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amountStr);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than ₹0.');
      return;
    }

    const defaultTitle = type === 'income' ? 'Income Credit' : (merchant.trim() || 'Expense');

    setIsSubmitted(true);
    try {
      await createTransaction({
        amount: Math.round(parsedAmount * 100), // convert to integer paise
        type,
        categoryId: selectedCatId,
        title: defaultTitle,
        merchant: merchant.trim() || undefined,
        paymentMethod,
        note: note.trim() || undefined,
      });

      router.back();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save transaction.');
      setIsSubmitted(false);
    }
  };

  const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 12) }]}>
      {/* Top Quick Context Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeftGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.pulseDot, { backgroundColor: colors.secondaryContainer }]} />
          <Text style={[typography.subtitle, { color: colors.textSecondary, fontWeight: '500' }]}>
            Quick Expense Capture
          </Text>
        </View>

        <View style={[styles.autoCatBadge, { backgroundColor: colors.surfaceContainerHigh }]}>
          <BadgeCheck size={14} color={colors.secondary} />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Auto-categorized
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Switcher Segmented Control */}
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceContainer }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setType('expense');
              setSelectedCatId(DEFAULT_CATEGORIES[0].id);
            }}
            style={[
              styles.segmentBtn,
              type === 'expense' && styles.segmentBtnActive,
            ]}
          >
            <View style={[styles.typeDot, { backgroundColor: colors.danger }]} />
            <Text
              style={[
                typography.subtitle,
                {
                  color: type === 'expense' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setType('income');
              const incCat = DEFAULT_CATEGORIES.find((c: Category) => c.type === 'income');
              if (incCat) setSelectedCatId(incCat.id);
            }}
            style={[
              styles.segmentBtn,
              type === 'income' && styles.segmentBtnActive,
            ]}
          >
            <View style={[styles.typeDot, { backgroundColor: colors.secondary }]} />
            <Text
              style={[
                typography.subtitle,
                {
                  color: type === 'income' ? colors.textPrimary : colors.textSecondary,
                  fontWeight: '600',
                },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Primary Amount Input Board */}
        <View style={[styles.amountBoard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }]}>
            Enter Amount (INR)
          </Text>

          <View style={styles.amountDisplayRow}>
            <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>₹</Text>
            <Text style={[typography.display, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
              {amountStr}
            </Text>
            <View style={[styles.blinkingCursor, { backgroundColor: colors.secondaryContainer }]} />
          </View>

          {/* Quick Preset Increment Chips */}
          <View style={styles.presetsRow}>
            {[50, 100, 500, 1000].map((amt) => (
              <TouchableOpacity
                key={`preset_${amt}`}
                activeOpacity={0.7}
                onPress={() => handlePresetAdd(amt)}
                style={[styles.presetChip, { backgroundColor: colors.surfaceContainerLow }]}
              >
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
                  +₹{amt >= 1000 ? '1,000' : amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Merchant & Note Card */}
        <View style={[styles.merchantNoteCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Merchant Input */}
          <View style={[styles.inputRow, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={[styles.inputIconCircle, { backgroundColor: colors.primaryContainer }]}>
              <Store size={18} color={colors.secondaryContainer} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Paid to / Merchant
              </Text>
              <TextInput
                value={merchant}
                onChangeText={setMerchant}
                placeholder="Enter recipient or store"
                placeholderTextColor={colors.textMuted}
                style={[typography.subtitle, { color: colors.textPrimary, padding: 0, marginTop: 2 }]}
              />
            </View>
            {merchant.length > 0 && (
              <TouchableOpacity onPress={() => setMerchant('')} style={styles.clearBtn}>
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Note Input */}
          <View style={[styles.inputRow, { backgroundColor: colors.surfaceContainerLow }]}>
            <View style={[styles.inputIconCircle, { backgroundColor: colors.surfaceContainer }]}>
              <FileText size={18} color={colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Note (Optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Lunch with team, groceries"
                placeholderTextColor={colors.textMuted}
                style={[typography.bodySm, { color: colors.textPrimary, padding: 0, marginTop: 2 }]}
              />
            </View>
          </View>
        </View>

        {/* Category Selector Carousel */}
        <View style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
                Category
              </Text>
              <View style={[styles.smartTag, { backgroundColor: 'rgba(182, 241, 106, 0.3)' }]}>
                <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Smart Tag
                </Text>
              </View>
            </View>
            <Text style={[typography.bodySm, { color: colors.secondary, fontWeight: '600' }]}>
              All
            </Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {filteredCategories.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => setSelectedCatId(cat.id)}
                  style={[
                    styles.catChip,
                    {
                      backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainerLow,
                      borderColor: isSelected ? colors.primaryContainer : colors.border,
                    },
                  ]}
                >
                  <View style={{ marginRight: 6 }}>
                    {getCategoryIcon(cat.icon, isSelected ? colors.secondaryContainer : cat.color, 16)}
                  </View>
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.onPrimary : colors.textPrimary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Payment Account Selector */}
        <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[typography.subtitle, { color: colors.textSecondary, fontWeight: '500' }]}>
              Payment Account
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap size={14} color={colors.secondary} />
              <Text style={[typography.caption, { color: colors.secondary, fontWeight: '600' }]}>
                Auto-detect
              </Text>
            </View>
          </View>

          <View style={styles.accountChipsRow}>
            {[
              { label: 'UPI', icon: Wallet, value: 'UPI' as PaymentMethod },
              { label: 'Cash', icon: Banknote, value: 'Cash' as PaymentMethod },
              { label: 'Card', icon: CreditCard, value: 'Debit Card' as PaymentMethod },
            ].map((acc) => {
              const isSelected = paymentMethod === acc.value || (acc.label === 'Card' && (paymentMethod === 'Debit Card' || paymentMethod === 'Credit Card'));
              const Icon = acc.icon;
              return (
                <TouchableOpacity
                  key={acc.label}
                  activeOpacity={0.7}
                  onPress={() => setPaymentMethod(acc.value)}
                  style={[
                    styles.accountChip,
                    {
                      backgroundColor: isSelected ? colors.primaryContainer : colors.surfaceContainer,
                    },
                  ]}
                >
                  <Icon size={16} color={isSelected ? colors.secondaryContainer : colors.textSecondary} />
                  <Text
                    style={[
                      typography.subtitle,
                      {
                        color: isSelected ? colors.onPrimary : colors.textPrimary,
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {acc.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Anti-duplicate Protection Alert */}
        <View style={[styles.alertBanner, { backgroundColor: colors.surfaceContainerHigh }]}>
          <ShieldCheck size={18} color={colors.secondary} />
          <Text style={[typography.caption, { color: colors.textPrimary, flex: 1 }]}>
            <Text style={{ fontWeight: '700' }}>Anti-duplicate active:</Text> Duplicate detection enabled.
          </Text>
        </View>

        {/* Tactile Micro-Keypad Tray with Save Button */}
        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSave={handleSave}
          isSaving={isCreating || isSubmitted}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  autoCatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 9999,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  amountBoard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 4,
  },
  blinkingCursor: {
    width: 2,
    height: 28,
    marginLeft: 4,
    borderRadius: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  merchantNoteCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 10,
  },
  inputIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  categoryCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smartTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  accountCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  accountChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  accountChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
});
