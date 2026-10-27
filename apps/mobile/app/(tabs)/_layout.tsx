import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Wallet, PieChart, Receipt, User, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeContext';

export default function TabsLayout() {
  const router = useRouter();
  const { colors, radii } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.surfaceContainer,
            borderTopWidth: 1,
            height: Platform.OS === 'android' ? 64 + insets.bottom : 58 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
            elevation: 10,
            shadowColor: '#172033',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.06,
            shadowRadius: 16,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        }}
      >
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }: { color: string; size?: number }) => <Wallet size={size || 22} color={color} />,
          }}
        />

        {/* Tab 2: Insights */}
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }: { color: string; size?: number }) => <PieChart size={size || 22} color={color} />,
          }}
        />

        {/* Center Prominent Add Button Placeholder Tab */}
        <Tabs.Screen
          name="add-placeholder"
          options={{
            title: '',
            tabBarButton: () => (
              <View style={styles.centerButtonWrapper}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => router.push('/modal/add-transaction')}
                  style={[
                    styles.floatingAddBtn,
                    {
                      backgroundColor: colors.secondaryContainer,
                      shadowColor: '#446E00',
                    },
                  ]}
                >
                  <Plus size={28} color={colors.secondary} strokeWidth={2.8} />
                </TouchableOpacity>
              </View>
            ),
          }}
        />

        {/* Tab 3: Activity */}
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color, size }: { color: string; size?: number }) => <Receipt size={size || 22} color={color} />,
          }}
        />

        {/* Tab 4: Budgets */}
        <Tabs.Screen
          name="budgets"
          options={{
            title: 'Budgets',
            tabBarIcon: ({ color, size }: { color: string; size?: number }) => <Wallet size={size || 22} color={color} />,
          }}
        />

        {/* Tab 5: Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }: { color: string; size?: number }) => <User size={size || 22} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  centerButtonWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingAddBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
});
