import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Shield,
  Moon,
  Sun,
  Coins,
  Globe,
  Sliders,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography, isDark, mode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();

  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [budgetLimit, setBudgetLimit] = useState<number>(45000);

  const handleExportData = () => {
    Alert.alert(
      'Export Complete Archive',
      'A complete encrypted archive of your transactions, categories, and budgets has been generated.',
      [{ text: 'Download JSON' }, { text: 'Close' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your SmartSpend account? This action is permanent and will delete all your financial records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            logout();
            Alert.alert('Account Deleted', 'Your data has been permanently removed.');
          },
        },
      ]
    );
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
          Profile & Settings
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.card,
              padding: spacing.lg,
            },
          ]}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.accent, borderRadius: radii.pill }]}>
              <Text style={[typography.headline, { color: colors.primary, fontWeight: '700' }]}>
                {user?.name ? user.name[0] : 'R'}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[typography.title, { color: colors.textPrimary }]}>
                  {user?.name || 'Rohan Sharma'}
                </Text>
                <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[typography.caption, { color: colors.accent, fontWeight: '700' }]}>
                    PRO
                  </Text>
                </View>
              </View>
              <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                {user?.email || 'user@smartspend.app'}
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Management Section */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }]}>
            Budget Preferences
          </Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card }]}>
            <View style={[styles.settingRow, { padding: spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Monthly Spend Limit
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Active limit for October 2026
                </Text>
              </View>
              <View style={[styles.valuePill, { backgroundColor: colors.cardSubtle }]}>
                <Text style={[typography.body, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                  ₹{budgetLimit.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }]}>
            App Preferences
          </Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card }]}>
            {/* Dark Mode */}
            <View style={[styles.settingRow, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isDark ? <Moon size={20} color={colors.textPrimary} /> : <Sun size={20} color={colors.textPrimary} />}
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Dark Theme
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                trackColor={{ false: colors.cardSubtle, true: colors.accentDark }}
                thumbColor={isDark ? colors.accent : '#F4F3F4'}
              />
            </View>

            {/* Currency */}
            <View style={[styles.settingRow, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Coins size={20} color={colors.textPrimary} />
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Preferred Currency
                </Text>
              </View>
              <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
                INR (₹)
              </Text>
            </View>

            {/* Timezone */}
            <View style={[styles.settingRow, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Globe size={20} color={colors.textPrimary} />
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Timezone
                </Text>
              </View>
              <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
                Asia/Kolkata
              </Text>
            </View>

            {/* Haptics */}
            <View style={[styles.settingRow, { padding: spacing.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Sliders size={20} color={colors.textPrimary} />
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Audio & Tactile Feedback
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: colors.cardSubtle, true: colors.accentDark }}
                thumbColor={hapticsEnabled ? colors.accent : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Privacy & Data Governance Section */}
        <View style={{ marginTop: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }]}>
            Privacy & Governance
          </Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radii.card }]}>
            {/* Export Data */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExportData}
              style={[styles.settingRow, { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Download size={20} color={colors.textPrimary} />
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  Export Financial Archive
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Delete Account */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDeleteAccount}
              style={[styles.settingRow, { padding: spacing.md }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Trash2 size={20} color={colors.danger} />
                <Text style={[typography.body, { color: colors.danger, fontWeight: '600' }]}>
                  Delete Account & Data
                </Text>
              </View>
              <ChevronRight size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radii.xl,
              marginTop: spacing.xl,
              padding: spacing.md,
            },
          ]}
        >
          <LogOut size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <Text style={[typography.body, { color: colors.textSecondary, fontWeight: '600' }]}>
            Log Out
          </Text>
        </TouchableOpacity>
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
    alignItems: 'center',
  },
  userCard: {
    borderWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  settingsGroup: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valuePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
