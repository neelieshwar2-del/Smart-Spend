import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, QrCode, ScanLine, Flashlight, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';

export default function ScanUpiModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();

  const [upiInput, setUpiInput] = useState<string>('');

  const handleCapture = () => {
    router.replace('/modal/add-transaction');
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16), paddingBottom: insets.bottom + 16 }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ScanLine size={24} color={colors.secondaryContainer} />
          <Text style={[typography.title, { color: '#FFFFFF', fontWeight: '700' }]}>
            Scan UPI QR Code
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.closeBtn}
        >
          <X size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Scanner Viewport */}
        <View style={[styles.viewfinder, { borderColor: colors.secondaryContainer }]}>
          <QrCode size={90} color="#64748B" style={{ opacity: 0.35 }} />
          <View style={[styles.laser, { backgroundColor: colors.secondaryContainer }]} />
          <Text style={[typography.caption, { color: colors.secondaryContainer, position: 'absolute', bottom: 12, fontWeight: '600' }]}>
            Align QR code inside frame
          </Text>
        </View>

        {/* Manual UPI Input & Capture Bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Enter UPI ID or Merchant"
            placeholderTextColor="#94A3B8"
            value={upiInput}
            onChangeText={setUpiInput}
            style={[typography.bodySm, styles.input]}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCapture}
            style={[styles.captureBtn, { backgroundColor: colors.secondaryContainer }]}
          >
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              Capture
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Utility Actions (Flashlight, Gallery) */}
        <View style={styles.bottomActions}>
          <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
            <Flashlight size={18} color="#94A3B8" />
            <Text style={[typography.caption, { color: '#94A3B8' }]}>Flashlight</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
            <ImageIcon size={18} color="#94A3B8" />
            <Text style={[typography.caption, { color: '#94A3B8' }]}>Upload QR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01081A',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    gap: 24,
  },
  viewfinder: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0px 4px 16px rgba(182, 241, 106, 0.25)',
    elevation: 6,
  },
  laser: {
    position: 'absolute',
    top: '40%',
    width: '90%',
    height: 2,
    boxShadow: '0px 0px 6px rgba(182, 241, 106, 0.8)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#172033',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#233048',
  },
  captureBtn: {
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
