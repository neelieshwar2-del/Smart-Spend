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
import { User, Lock, Mail, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
import { Button } from '../../src/components/common/Button';
import { api } from '../../src/services/api';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Required Fields', 'Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.register(name, email, password);
      Alert.alert('Welcome to SmartSpend!', 'Your account has been created.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (e: any) {
      Alert.alert('Registration Error', e?.message || 'Could not register account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 20), paddingHorizontal: spacing.xl }]}>
      {/* Back button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <ArrowLeft size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={[typography.hero, { color: colors.textPrimary, fontWeight: '700' }]}>
          Create Account
        </Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
          Start tracking expenses and managing budgets effortlessly
        </Text>
      </View>

      {/* Form */}
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radii.card,
            padding: spacing.xl,
            marginTop: 24,
          },
        ]}
      >
        {/* Full Name */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Full Name
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.md }]}>
            <User size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="e.g. Rohan Sharma"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[typography.body, { flex: 1, color: colors.textPrimary }]}
            />
          </View>
        </View>

        {/* Email */}
        <View style={{ marginBottom: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Email Address
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.md }]}>
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

        {/* Password */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
            Password (min 8 chars)
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.cardSubtle, borderColor: colors.border, borderRadius: radii.md }]}>
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

        {/* Submit */}
        <Button
          title="Create Account"
          onPress={handleRegister}
          variant="primary"
          loading={loading}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
