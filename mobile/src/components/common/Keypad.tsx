import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Delete } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MinTouchTarget } from '../../theme/tokens';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onQuickAdd: (amount: number) => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onBackspace, onQuickAdd }) => {
  const { colors, spacing, radii, typography } = useTheme();

  const presets = [50, 100, 500, 1000];
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <View style={styles.container}>
      {/* Quick Increment Preset Chips */}
      <View style={[styles.presetsRow, { marginBottom: spacing.md }]}>
        {presets.map((amt) => (
          <TouchableOpacity
            key={`preset_${amt}`}
            activeOpacity={0.7}
            onPress={() => onQuickAdd(amt)}
            style={[
              styles.presetChip,
              {
                backgroundColor: colors.cardSubtle,
                borderColor: colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
              },
            ]}
          >
            <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: '700' }]}>
              +₹{amt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 4x3 Numeric Keypad Grid */}
      <View style={styles.grid}>
        {keys.map((row, rowIndex) => (
          <View key={`row_${rowIndex}`} style={[styles.row, { marginBottom: spacing.sm }]}>
            {row.map((k) => {
              const isBackspace = k === 'backspace';
              return (
                <TouchableOpacity
                  key={`key_${k}`}
                  activeOpacity={0.6}
                  onPress={() => (isBackspace ? onBackspace() : onKeyPress(k))}
                  style={[
                    styles.key,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  {isBackspace ? (
                    <Delete size={22} color={colors.textPrimary} />
                  ) : (
                    <Text style={[typography.headline, { color: colors.textPrimary }]}>
                      {k}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 36,
  },
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  key: {
    flex: 1,
    height: 56,
    minHeight: MinTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
