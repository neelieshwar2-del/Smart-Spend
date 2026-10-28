import React from 'react';
import { Text, TextStyle, StyleProp, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CurrencyTextProps {
  amount: number | string; // in paise or pre-formatted string
  type?: 'expense' | 'income' | 'neutral';
  showSign?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'display';
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const CurrencyText: React.FC<CurrencyTextProps> = ({
  amount,
  type = 'neutral',
  showSign = false,
  size = 'md',
  color,
  style,
}) => {
  const { colors, typography } = useTheme();

  // If amount is a number, assume paise and format to INR
  let formatted = '';
  if (typeof amount === 'number') {
    const rupees = Number((amount / 100).toFixed(2));
    formatted = '₹' + rupees.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formatted = amount.startsWith('₹') ? amount : `₹${amount}`;
  }

  let signPrefix = '';
  if (showSign) {
    if (type === 'income') signPrefix = '+';
    else if (type === 'expense') signPrefix = '-';
  }

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return typography.bodySm;
      case 'lg':
        return typography.title;
      case 'xl':
        return typography.headline;
      case 'hero':
        return typography.hero;
      case 'display':
        return typography.display;
      case 'md':
      default:
        return typography.body;
    }
  };

  const getDefaultColor = () => {
    if (color) return color;
    if (type === 'income') return colors.success;
    if (type === 'expense') return colors.textPrimary;
    return colors.textPrimary;
  };

  return (
    <Text
      style={[
        getSizeStyle(),
        typography.currency,
        { color: getDefaultColor(), fontWeight: '700' },
        style,
      ]}
    >
      {signPrefix}{formatted}
    </Text>
  );
};
