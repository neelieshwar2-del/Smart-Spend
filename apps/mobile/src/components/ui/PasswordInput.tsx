import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Password',
  style,
}) => {
  const { colors, radii, spacing, typography } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardSubtle,
          borderColor: colors.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <Lock size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        style={[typography.body, { flex: 1, color: colors.textPrimary, paddingVertical: 12 }]}
      />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowPassword((prev) => !prev)}
        style={styles.eyeBtn}
      >
        {showPassword ? (
          <EyeOff size={18} color={colors.textSecondary} />
        ) : (
          <Eye size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  eyeBtn: {
    padding: 6,
  },
});
