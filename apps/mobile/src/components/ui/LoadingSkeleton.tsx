import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface LoadingSkeletonProps {
  height?: number;
  width?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  height = 20,
  width = '100%',
  borderRadius,
  style,
}) => {
  const { colors, radii } = useTheme();

  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width: width as any,
          backgroundColor: colors.cardSubtle,
          borderRadius: borderRadius ?? radii.md,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    opacity: 0.7,
  },
});
