import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, QrCode, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

export default function ScanUpiModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const presets = [
    { merchant: 'Blue Tokai Coffee Roasters', vpa: 'bluetokai@icici', amount: 450, categoryId: 'cat_food' },
    { merchant: 'Uber India Technology', vpa: 'uber.ride@axis', amount: 390, categoryId: 'cat_transport' },
    { merchant: 'Blinkit Instant Commerce', vpa: 'blinkit@hdfcbank', amount: 1450, categoryId: 'cat_groceries' },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    // Open add-transaction prefilled
    router.replace('/modal/add-transaction');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Scan Any UPI QR</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, alignItems: 'center', paddingBottom: insets.bottom + 20 }}>
        {/* Scanner Viewfinder Box */}
        <View style={[styles.viewfinder, { borderColor: colors.accent, borderRadius: radii.xl }]}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          <QrCode size={110} color={colors.textSecondary} style={{ opacity: 0.3 }} />

          {/* Animated Laser Line */}
          <View style={[styles.laser, { backgroundColor: colors.accent }]} />
        </View>

        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600', marginTop: spacing.lg }]}>
          Point Camera at BharatPe / Paytm / PhonePe QR
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, maxWidth: 280 }]}>
          Automatically extracts merchant name, UPI ID, and pre-fills your transaction.
        </Text>

        {/* Quick Simulator Presets */}
        <View style={{ width: '100%', marginTop: spacing.xl }}>
          <Text style={[typography.caption, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }]}>
            Quick Sample QR Codes
          </Text>

          {presets.map((p) => (
            <TouchableOpacity
              key={p.vpa}
              activeOpacity={0.8}
              onPress={() => handleSelectPreset(p)}
              style={[
                styles.presetCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '600' }]}>
                  {p.merchant}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>
                  {p.vpa}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.body, typography.currency, { color: colors.textPrimary, fontWeight: '700' }]}>
                  ₹{p.amount}.00
                </Text>
                <Text style={[typography.caption, { color: colors.accentDark, fontWeight: '700' }]}>
                  Simulate Tap
                </Text>
              </View>
            </TouchableOpacity>
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  viewfinder: {
    width: 250,
    height: 250,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  laser: {
    position: 'absolute',
    width: '90%',
    height: 3,
    top: '50%',
    shadowColor: '#B8F36B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#B8F36B',
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#B8F36B',
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#B8F36B',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#B8F36B',
  },
  presetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
  },
});
