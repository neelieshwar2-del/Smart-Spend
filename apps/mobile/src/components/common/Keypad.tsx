import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Delete, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onBackspace,
  onSave,
  isSaving = false,
}) => {
  const { colors, spacing, radii, typography } = useTheme();

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace'],
  ];

  return (
    <View
      style={[
        styles.tray,
        {
          backgroundColor: colors.surfaceContainer,
          borderRadius: 20,
          padding: 10,
        },
      ]}
    >
      {/* 4x3 Numeric Keypad Grid */}
      <View style={styles.grid}>
        {keys.map((row, rowIndex) => (
          <View key={`row_${rowIndex}`} style={styles.row}>
            {row.map((k) => {
              const isBackspace = k === 'backspace';
              return (
                <TouchableOpacity
                  key={`key_${k}`}
                  activeOpacity={0.65}
                  onPress={() => (isBackspace ? onBackspace() : onKeyPress(k))}
                  style={[
                    styles.key,
                    {
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  {isBackspace ? (
                    <Delete size={20} color={colors.textPrimary} />
                  ) : (
                    <Text
                      style={[
                        typography.headline,
                        { color: colors.textPrimary, fontWeight: '600' },
                      ]}
                    >
                      {k}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Primary Action Save Button */}
      {onSave && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSave}
          disabled={isSaving}
          style={[
            styles.saveBtn,
            {
              backgroundColor: colors.secondaryContainer,
              opacity: isSaving ? 0.6 : 1,
            },
          ]}
        >
          <CheckCircle2 size={22} color={colors.primary} />
          <Text
            style={[
              typography.headline,
              { color: colors.primary, fontWeight: '700', marginLeft: 8 },
            ]}
          >
            {isSaving ? 'Saving...' : 'Save Transaction'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tray: {
    width: '100%',
    gap: 8,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  key: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  saveBtn: {
    width: '100%',
    height: 52,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#446E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
