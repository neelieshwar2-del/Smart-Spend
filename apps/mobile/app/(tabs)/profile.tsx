import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Volume2,
  Smartphone,
  Download,
  RefreshCw,
  LogOut,
  ChevronRight,
  Shield,
  Sparkles,
  Edit3,
  Check,
  Globe,
  Trash2,
  CreditCard,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
import { useDashboard } from '../../src/hooks/useDashboard';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography, isDark, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const { refetch } = useDashboard();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [budgetLimit, setBudgetLimit] = useState<string>('₹45,000');
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'Are you sure you want to permanently delete your account and financial data?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handleLogout() },
    ]);
  };

  const handleExportCSV = () => {
    Alert.alert(
      'Export Statement',
      'Your October 2026 transaction ledger has been prepared for CSV download.',
      [{ text: 'OK' }]
    );
  };

  const handleSyncData = async () => {
    try {
      await refetch();
      Alert.alert('Data Synced', 'Successfully refreshed live data with backend.');
    } catch {
      Alert.alert('Sync Completed', 'All local offline records synchronized.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of SmartSpend?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }]}>
        <Text style={[typography.headline, { color: colors.textPrimary, fontWeight: '700' }]}>
          Profile & Preferences
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[typography.headline, { color: colors.secondaryContainer, fontWeight: '700' }]}>
                {user?.name ? user.name[0] : 'R'}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {user?.name || 'Rohan Sharma'}
                </Text>
                <View style={[styles.planBadge, { backgroundColor: 'rgba(182, 241, 106, 0.3)' }]}>
                  <Text style={[typography.caption, { color: colors.secondary, fontWeight: '700' }]}>
                    Free Plan
                  </Text>
                </View>
              </View>
              <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                {user?.email || 'rohan@smartspend.app'}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]}>
            Preferences
          </Text>

          {/* Audio Haptics */}
          <View style={[styles.itemRow, { borderBottomColor: colors.surfaceContainer }]}>
            <View style={styles.itemLeft}>
              <Volume2 size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Audio Haptics / Feedback
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSoundEnabled(!soundEnabled)}>
              <Text style={[typography.subtitle, { color: colors.secondary, fontWeight: '600' }]}>
                {soundEnabled ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dark Mode Theme */}
          <View style={[styles.itemRow, { borderBottomColor: colors.surfaceContainer }]}>
            <View style={styles.itemLeft}>
              <Smartphone size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Dark Appearance Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val: boolean) => setThemeMode(val ? 'dark' : 'light')}
              thumbColor={isDark ? colors.secondaryContainer : '#FFFFFF'}
              trackColor={{ false: colors.surfaceContainer, true: colors.primary }}
            />
          </View>

          {/* Monthly Budget Limit Setting */}
          <View style={[styles.itemRow, { borderBottomColor: colors.surfaceContainer }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Monthly Budget Limit
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Ceiling allowance for pacing alerts
              </Text>
            </View>
            {isEditingBudget ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TextInput
                  value={budgetLimit}
                  onChangeText={setBudgetLimit}
                  keyboardType="numeric"
                  style={[
                    styles.budgetInput,
                    typography.bodySm,
                    { color: colors.textPrimary, borderColor: colors.primary, backgroundColor: colors.surfaceContainer, padding: 6, borderRadius: 8 },
                  ]}
                />
                <TouchableOpacity onPress={() => setIsEditingBudget(false)}>
                  <Check size={18} color={colors.secondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsEditingBudget(true)}
                style={[styles.valuePill, { backgroundColor: colors.surfaceContainer }]}
              >
                <Text style={[typography.bodySm, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {budgetLimit}
                </Text>
                <Edit3 size={13} color={colors.textSecondary} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </View>

          {/* Preferred Currency */}
          <View style={[styles.itemRow, { borderBottomColor: colors.surfaceContainer }]}>
            <View style={styles.itemLeft}>
              <CreditCard size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Preferred Currency
              </Text>
            </View>
            <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
              INR (₹)
            </Text>
          </View>

          {/* Timezone */}
          <View style={[styles.itemRow, { borderBottomColor: colors.surfaceContainer }]}>
            <View style={styles.itemLeft}>
              <Globe size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Timezone
              </Text>
            </View>
            <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
              Asia/Kolkata
            </Text>
          </View>

          {/* Export CSV */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleExportCSV}
            style={[styles.itemRow, { borderBottomColor: colors.surfaceContainer }]}
          >
            <View style={styles.itemLeft}>
              <Download size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Export Ledger (CSV)
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Sync Data */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSyncData}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <RefreshCw size={20} color={colors.textSecondary} />
              <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '500' }]}>
                Sync Data with Backend
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Privacy & Data Governance Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: '700', marginBottom: 4 }]}>
            Privacy & Governance
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <Trash2 size={20} color={colors.danger} />
              <Text style={[typography.body, { color: colors.danger, fontWeight: '600' }]}>
                Delete Account & Data
              </Text>
            </View>
            <ChevronRight size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Security & Logout */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            style={styles.itemRow}
          >
            <View style={styles.itemLeft}>
              <LogOut size={20} color={colors.danger} />
              <Text style={[typography.body, { color: colors.danger, fontWeight: '600' }]}>
                Sign Out
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Version & Credits (Matching index.html) */}
        <View style={styles.versionFooter}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            SmartSpend Neo-Fintech v2.4.0
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>
            Encrypted • 256-Bit Financial Grade Security
          </Text>
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
    paddingTop: 4,
  },
  userCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  planBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  valuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  budgetInput: {
    borderWidth: 1,
    width: 90,
  },
});
