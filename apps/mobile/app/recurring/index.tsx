import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Calendar, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { api } from '../../src/services/api';
import { RecurringRule } from '../../src/types';
import { CurrencyText } from '../../src/components/ui/CurrencyText';

export default function RecurringScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [rules, setRules] = useState<RecurringRule[]>([]);

  useEffect(() => {
    api.getRecurring()
      .then(items => {
        if (items) setRules(items);
      })
      .catch(() => {});
  }, []);

  const totalMonthlyCommitment = rules
    .filter(r => r.isActive)
    .reduce((sum, r) => sum + r.amount, 0);

  const handleToggle = (id: string) => {
    setRules(prev =>
      prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleAddRule = () => {
    Alert.alert(
      'New Recurring Autopay',
      'Add a new subscription or recurring expense rule.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ArrowLeft size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[typography.title, { color: colors.textPrimary }]}>Recurring Autopays</Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleAddRule}
          style={[styles.addBtn, { backgroundColor: colors.accent, borderRadius: radii.pill }]}
        >
          <Plus size={16} color={colors.primary} />
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700', marginLeft: 4 }]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Commitment Summary Card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.primary,
              borderRadius: radii.card,
              padding: spacing.xl,
              marginTop: spacing.md,
            },
          ]}
        >
          <Text style={[typography.caption, { color: '#94A3B8', textTransform: 'uppercase' }]}>
            Monthly Recurring Commitment
          </Text>
          <CurrencyText
            amount={totalMonthlyCommitment}
            size="hero"
            color={colors.accent}
            style={{ marginTop: 4 }}
          />
          <Text style={[typography.caption, { color: '#94A3B8', marginTop: 4 }]}>
            Across {rules.filter(r => r.isActive).length} active autopays and subscriptions
          </Text>
        </View>

        {/* Subscriptions List */}
        <View style={{ marginTop: spacing.xl }}>
          <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            Active Subscriptions
          </Text>

          {rules.map((rule) => (
            <View
              key={rule.id}
              style={[
                styles.ruleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                  opacity: rule.isActive ? 1 : 0.6,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                    {rule.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <Calendar size={12} color={colors.textSecondary} />
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      Next: {rule.nextDueDate} • {rule.frequency}
                    </Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                  <CurrencyText amount={rule.amountFormatted} size="md" />
                </View>

                <Switch
                  value={rule.isActive}
                  onValueChange={() => handleToggle(rule.id)}
                  trackColor={{ false: colors.cardSubtle, true: colors.accentDark }}
                  thumbColor={rule.isActive ? colors.accent : '#F4F3F4'}
                />
              </View>
            </View>
          ))}
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  summaryCard: {
    width: '100%',
  },
  ruleCard: {
    borderWidth: 1,
  },
});
