import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MinTouchTarget } from '../../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { colors, radii, spacing, typography } = useTheme();

  const getButtonStyles = (): { bg: string; border: string; text: string } => {
    if (disabled) {
      return {
        bg: colors.cardSubtle,
        border: 'transparent',
        text: colors.textMuted,
      };
    }

    switch (variant) {
      case 'accent':
        return {
          bg: colors.accent,
          border: 'transparent',
          text: colors.primary,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: colors.border,
          text: colors.textPrimary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: colors.textPrimary,
        };
      case 'danger':
        return {
          bg: colors.danger,
          border: 'transparent',
          text: colors.textInverse,
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          border: 'transparent',
          text: colors.textInverse,
        };
    }
  };

  const { bg, border, text } = getButtonStyles();

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 40 };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 54 };
      case 'md':
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: MinTouchTarget };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getPadding(),
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: border !== 'transparent' ? 1 : 0,
          borderRadius: radii.xl,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              size === 'sm' ? typography.bodySm : typography.body,
              { color: text, fontWeight: '600' },
              icon ? { marginLeft: spacing.xs } : {},
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
