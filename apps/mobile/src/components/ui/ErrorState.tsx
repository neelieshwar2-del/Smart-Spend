import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../common/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not fetch your financial data. Please check your connection and try again.',
  onRetry,
  style,
}) => {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.dangerLight,
          borderColor: colors.danger,
          borderRadius: radii.card,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <AlertCircle size={32} color={colors.danger} />

      <Text style={[typography.title, { color: colors.danger, marginTop: spacing.md, textAlign: 'center' }]}>
        {title}
      </Text>

      <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4, textAlign: 'center', maxWidth: 280 }]}>
        {message}
      </Text>

      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={{ marginTop: spacing.lg }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
