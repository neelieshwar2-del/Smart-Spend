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
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Button } from '../../src/components/common/Button';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    // Simulate recovery email dispatch
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 20), paddingHorizontal: spacing.xl }]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.back()}
        style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <ArrowLeft size={18} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={{ marginTop: 24 }}>
        <Text style={[typography.hero, { color: colors.textPrimary, fontWeight: '700' }]}>
          Reset Password
        </Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
          Enter your registered email address to receive password recovery instructions.
        </Text>
      </View>

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
        {submitted ? (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <CheckCircle2 size={44} color={colors.success} />
            <Text style={[typography.title, { color: colors.textPrimary, marginTop: 12, textAlign: 'center' }]}>
              Check Your Inbox
            </Text>
            <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 6, textAlign: 'center' }]}>
              If an account exists for {email}, a recovery link has been dispatched.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.replace('/(auth)/login')}
              variant="outline"
              size="md"
              style={{ marginTop: 20, width: '100%' }}
            />
          </View>
        ) : (
          <>
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 }]}>
                Registered Email
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

            <Button
              title="Send Recovery Instructions"
              onPress={handleSubmit}
              variant="primary"
              loading={loading}
              style={{ width: '100%' }}
            />
          </>
        )}
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
