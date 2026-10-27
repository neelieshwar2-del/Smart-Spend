import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', style }) => {
  const { colors, radii, spacing, typography } = useTheme();

  const getConfig = () => {
    switch (type) {
      case 'error':
        return {
          bg: colors.dangerLight,
          border: colors.danger,
          text: colors.danger,
          icon: <AlertCircle size={18} color={colors.danger} />,
        };
      case 'warning':
        return {
          bg: colors.warningLight,
          border: colors.warning,
          text: colors.warning,
          icon: <AlertTriangle size={18} color={colors.warning} />,
        };
      case 'info':
        return {
          bg: colors.infoLight,
          border: colors.info,
          text: colors.info,
          icon: <Info size={18} color={colors.info} />,
        };
      case 'success':
      default:
        return {
          bg: colors.successLight,
          border: colors.success,
          text: colors.success,
          icon: <CheckCircle2 size={18} color={colors.success} />,
        };
    }
  };

  const { bg, border, text, icon } = getConfig();

  return (
    <View
      style={[
        styles.toast,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        },
        style,
      ]}
    >
      {icon}
      <Text style={[typography.bodySm, { color: text, fontWeight: '600', marginLeft: 8, flex: 1 }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
});
