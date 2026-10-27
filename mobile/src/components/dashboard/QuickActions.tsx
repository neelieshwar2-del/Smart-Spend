import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlusCircle, QrCode, Sparkles, LineChart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const { colors, spacing, radii, typography } = useTheme();

  const actions = [
    {
      title: 'Add Expense',
      icon: PlusCircle,
      onPress: () => router.push('/modal/add-transaction'),
      bg: colors.accent,
      iconColor: colors.primary,
    },
    {
      title: 'Scan UPI',
      icon: QrCode,
      onPress: () => router.push('/modal/scan-upi'),
      bg: colors.card,
      iconColor: colors.textPrimary,
    },
    {
      title: 'Smart AI',
      icon: Sparkles,
      onPress: () => router.push('/modal/ai-assistant'),
      bg: colors.card,
      iconColor: '#8B5CF6',
    },
    {
      title: 'Insights',
      icon: LineChart,
      onPress: () => router.push('/(tabs)/insights'),
      bg: colors.card,
      iconColor: colors.textPrimary,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <TouchableOpacity
            key={act.title}
            activeOpacity={0.7}
            onPress={act.onPress}
            style={[
              styles.actionItem,
              {
                backgroundColor: act.bg,
                borderRadius: radii.xl,
                borderColor: colors.border,
                borderWidth: act.bg === colors.card ? 1 : 0,
                padding: spacing.md,
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon size={20} color={act.iconColor} />
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: act.bg === colors.accent ? colors.primary : colors.textPrimary,
                  fontWeight: '700',
                  marginTop: 4,
                },
              ]}
            >
              {act.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
