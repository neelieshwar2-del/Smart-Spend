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
import { X, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Keypad } from '../../src/components/common/Keypad';
import { useTransactions } from '../../src/hooks/useTransactions';
import { INITIAL_CATEGORIES } from '../../src/services/mockData';
import { TransactionType, PaymentMethod, Category } from '../../src/types';
import { getCategoryIcon } from '../../src/components/dashboard/RecentTransactions';

export default function AddTransactionModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { createTransaction, isCreating } = useTransactions();

  // State
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('0');
  const [selectedCatId, setSelectedCatId] = useState<string>(INITIAL_CATEGORIES[0].id);
  const [title, setTitle] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [note, setNote] = useState<string>('');
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

  const handleQuickAdd = (amt: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(Math.round(current + amt)));
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amountStr);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than ₹0.');
      return;
    }

    const defaultTitle = type === 'income' ? 'Income Credit' : (merchant || 'Expense');
    const finalTitle = title.trim() || defaultTitle;

    setIsSubmitted(true);
    try {
      await createTransaction({
        amount: Math.round(parsedAmount * 100), // convert to paise
        type,
        categoryId: selectedCatId,
        title: finalTitle,
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

  const paymentMethods: PaymentMethod[] = ['UPI', 'Cash', 'Debit Card', 'Credit Card'];
  const filteredCategories = INITIAL_CATEGORIES.filter(c => c.type === type);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[typography.title, { color: colors.textPrimary }]}>
          Record {type === 'expense' ? 'Expense' : 'Income'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isCreating || isSubmitted}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: radii.pill,
              opacity: isCreating || isSubmitted ? 0.6 : 1,
            },
          ]}
        >
          <Check size={18} color={colors.primary} strokeWidth={2.5} />
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700', marginLeft: 4 }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20 }}>
        {/* Type Segmented Switcher */}
        <View
          style={[
            styles.segmentedControl,
            { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.pill },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setType('expense');
              setSelectedCatId(INITIAL_CATEGORIES[0].id);
            }}
            style={[
              styles.segmentTab,
              type === 'expense' && { backgroundColor: colors.primary, borderRadius: radii.pill },
            ]}
          >
            <Text
              style={[
                typography.bodySm,
                { color: type === 'expense' ? colors.textInverse : colors.textSecondary, fontWeight: '700' },
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setType('income');
              const incCat = INITIAL_CATEGORIES.find((c: Category) => c.type === 'income');
              if (incCat) setSelectedCatId(incCat.id);
            }}
            style={[
              styles.segmentTab,
              type === 'income' && { backgroundColor: colors.primary, borderRadius: radii.pill },
            ]}
          >
            <Text
              style={[
                typography.bodySm,
                { color: type === 'income' ? colors.textInverse : colors.textSecondary, fontWeight: '700' },
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Amount Display */}
        <View style={styles.amountDisplay}>
          <Text style={[typography.display, typography.currency, { color: colors.textPrimary }]}>
            ₹{amountStr}
          </Text>
        </View>

        {/* Tactile Keypad */}
        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onQuickAdd={handleQuickAdd}
        />

        {/* Category Carousel */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 }]}>
            Select Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
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
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <View style={{ marginRight: 6 }}>
                    {getCategoryIcon(cat.icon, isSelected ? colors.accent : cat.color, 16)}
                  </View>
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.textInverse : colors.textPrimary,
                        fontWeight: '700',
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

        {/* Merchant / Description Input */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Merchant / Description
          </Text>
          <TextInput
            placeholder="e.g. Blue Tokai, Swiggy, Uber"
            placeholderTextColor={colors.textMuted}
            value={merchant}
            onChangeText={setMerchant}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radii.md,
                color: colors.textPrimary,
                fontSize: 15,
              },
            ]}
          />
        </View>

        {/* Payment Method Selector */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Payment Method
          </Text>
          <View style={styles.paymentMethodsRow}>
            {paymentMethods.map((pm) => {
              const isSelected = paymentMethod === pm;
              return (
                <TouchableOpacity
                  key={pm}
                  activeOpacity={0.7}
                  onPress={() => setPaymentMethod(pm)}
                  style={[
                    styles.pmChip,
                    {
                      backgroundColor: isSelected ? colors.cardSubtle : colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.caption,
                      {
                        color: isSelected ? colors.primary : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {pm}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    marginVertical: 12,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pmChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});
