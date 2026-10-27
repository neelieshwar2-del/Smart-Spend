import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { MinTouchTarget } from '../../theme/tokens';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'card' | 'accent' | 'primary' | 'subtle';
  size?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'card',
  size = MinTouchTarget,
  style,
}) => {
  const { colors, radii } = useTheme();

  const getBackground = () => {
    switch (variant) {
      case 'accent':
        return colors.accent;
      case 'primary':
        return colors.primary;
      case 'subtle':
        return colors.cardSubtle;
      case 'card':
      default:
        return colors.card;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: radii.pill,
          backgroundColor: getBackground(),
          borderColor: colors.border,
          borderWidth: variant === 'card' ? 1 : 0,
        },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
