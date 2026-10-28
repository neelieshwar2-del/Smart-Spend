import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      paddingTop: Math.max(insets.top, 16),
    },
    style,
  ];

  if (!scrollable) {
    return <View style={containerStyle}>{children}</View>;
  }

  return (
    <View style={containerStyle}>
      <ScrollView
        contentContainerStyle={[
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 90,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
