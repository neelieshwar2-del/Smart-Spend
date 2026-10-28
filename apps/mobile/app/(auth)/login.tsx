import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Lock, Mail } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/common/Button';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState<string>('user@smartspend.app');
  const [password, setPassword] = useState<string>('Password123');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e?.message || 'Check your credentials and try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 24), paddingHorizontal: spacing.xl }]}>
      {/* Brand Header */}
      <View style={{ alignItems: 'center', marginTop: 32 }}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primary, borderRadius: radii.xl }]}>
          <Sparkles size={32} color={colors.accent} />
        </View>
        <Text style={[typography.hero, { color: colors.textPrimary, fontWeight: '700', marginTop: 16 }]}>
          SmartSpend
        </Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4, textAlign: 'center' }]}>
          AI-Powered Neo-Fintech Expense & Budget Manager
        </Text>
      </View>

      {/* Form Card */}
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radii.card,
            padding: spacing.xl,
            marginTop: 32,
          },
        ]}
      >
        <Text style={[typography.title, { color: colors.textPrimary, marginBottom: spacing.md }]}>
          Welcome Back
        </Text>

        {/* Email Field */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Email Address
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.md },
            ]}
          >
            <Mail size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="you@domain.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[typography.body, { flex: 1, color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Password
          </Text>
          <View
            style={[
              styles.inputWrap,
              { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.md },
            ]}
          >
            <Lock size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[typography.body, { flex: 1, color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Button
          title="Sign In to SmartSpend"
          onPress={handleLogin}
          variant="primary"
          loading={isLoading}
          style={{ width: '100%' }}
        />

        {/* Register Navigation */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/(auth)/register')}
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: colors.primary, fontWeight: '700' }}>Create One</Text>
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
  logoWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formCard: {
    width: '100%',
    borderWidth: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
});
