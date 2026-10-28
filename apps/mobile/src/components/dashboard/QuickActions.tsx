import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, QrCode, LineChart, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';

export const QuickActions: React.FC = () => {
  const router = useRouter();
  const { colors, typography } = useTheme();

  const actions = [
    {
      title: 'Add Expense',
      icon: Plus,
      onPress: () => router.push('/modal/add-transaction'),
      iconBg: colors.secondaryContainer,
      iconColor: colors.secondary,
      strokeWidth: 2.5,
    },
    {
      title: 'Scan UPI',
      icon: QrCode,
      onPress: () => router.push('/modal/scan-upi'),
      iconBg: colors.surfaceContainer,
      iconColor: colors.textPrimary,
      strokeWidth: 2,
    },
    {
      title: 'Insights',
      icon: LineChart,
      onPress: () => router.push('/(tabs)/insights'),
      iconBg: colors.surfaceContainer,
      iconColor: colors.textPrimary,
      strokeWidth: 2,
    },
    {
      title: 'Smart AI',
      icon: Sparkles,
      onPress: () => router.push('/modal/ai-assistant'),
      iconBg: colors.surfaceContainer,
      iconColor: colors.textPrimary,
      strokeWidth: 2,
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <TouchableOpacity
            key={act.title}
            activeOpacity={0.8}
            onPress={act.onPress}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: act.iconBg }]}>
              <Icon size={20} color={act.iconColor} strokeWidth={act.strokeWidth} />
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: colors.textPrimary,
                  fontWeight: '600',
                  marginTop: 6,
                  textAlign: 'center',
                },
              ]}
              numberOfLines={1}
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
    gap: 10,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
