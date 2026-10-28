import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, typography } = useTheme();

  return (
    <View style={[styles.header, style]}>
      <View>
        <Text style={[typography.headline, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {actionTitle && onAction && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAction}
          style={styles.actionBtn}
        >
          <Text style={[typography.bodySm, { color: colors.textSecondary, fontWeight: '600' }]}>
            {actionTitle}
          </Text>
          <ChevronRight size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
