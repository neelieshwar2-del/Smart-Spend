import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../common/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, spacing, radii, typography } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radii.card,
          padding: spacing.xl,
        },
        style,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.cardSubtle, borderRadius: radii.xl }]}>
        {icon || <Inbox size={32} color={colors.textSecondary} />}
      </View>

      <Text style={[typography.title, { color: colors.textPrimary, marginTop: spacing.md, textAlign: 'center' }]}>
        {title}
      </Text>

      {description && (
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4, textAlign: 'center', maxWidth: 280 }]}>
          {description}
        </Text>
      )}

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
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
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
