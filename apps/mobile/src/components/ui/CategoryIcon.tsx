import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  Utensils,
  Car,
  ShoppingCart,
  ShoppingBag,
  Zap,
  Film,
  Heart,
  Briefcase,
  TrendingUp,
  Book,
  Laptop,
  Receipt,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface CategoryIconProps {
  iconName: string;
  color?: string;
  size?: number;
  containerSize?: number;
  style?: ViewStyle;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  iconName,
  color,
  size = 18,
  containerSize = 40,
  style,
}) => {
  const { colors, radii } = useTheme();
  const iconColor = color || colors.accentDark;

  const renderIcon = () => {
    switch (iconName?.toLowerCase()) {
      case 'utensils':
      case 'food':
        return <Utensils size={size} color={iconColor} />;
      case 'car':
      case 'transport':
        return <Car size={size} color={iconColor} />;
      case 'shopping-cart':
      case 'groceries':
        return <ShoppingCart size={size} color={iconColor} />;
      case 'shopping-bag':
      case 'shopping':
        return <ShoppingBag size={size} color={iconColor} />;
      case 'zap':
      case 'utilities':
      case 'bills':
        return <Zap size={size} color={iconColor} />;
      case 'film':
      case 'entertainment':
        return <Film size={size} color={iconColor} />;
      case 'heart':
      case 'health':
      case 'fitness':
        return <Heart size={size} color={iconColor} />;
      case 'briefcase':
      case 'salary':
        return <Briefcase size={size} color={iconColor} />;
      case 'trending-up':
      case 'investments':
        return <TrendingUp size={size} color={iconColor} />;
      case 'book':
      case 'education':
        return <Book size={size} color={iconColor} />;
      case 'laptop':
      case 'freelance':
        return <Laptop size={size} color={iconColor} />;
      default:
        return <Receipt size={size} color={iconColor} />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: radii.md,
          backgroundColor: `${iconColor}1F`,
        },
        style,
      ]}
    >
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
