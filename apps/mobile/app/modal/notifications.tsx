import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCheck, Bell, AlertTriangle, Calendar, Receipt } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { api } from '../../src/services/api';
import { NotificationItem } from '../../src/types';

export default function NotificationsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api.getNotifications()
      .then(items => {
        if (items) setNotifications(items);
      })
      .catch(() => {});
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BUDGET_WARNING':
        return <AlertTriangle size={18} color={colors.danger} />;
      case 'RECURRING_DUE':
        return <Calendar size={18} color={colors.info} />;
      default:
        return <Receipt size={18} color={colors.secondary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header matching index.html */}
      <View style={[styles.header, { borderBottomColor: colors.surfaceContainer }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[typography.title, { color: colors.textPrimary, fontWeight: '700' }]}>
            Notifications
          </Text>
          <View style={[styles.updatesBadge, { backgroundColor: colors.secondaryContainer }]}>
            <Text style={[typography.caption, { color: colors.secondary, fontWeight: '700' }]}>
              Updates
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleMarkAllRead}>
            <Text style={[typography.caption, { color: colors.secondary, fontWeight: '700' }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={[styles.closeBtn, { backgroundColor: colors.surfaceContainer }]}
          >
            <X size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 20, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item) => {
          const isUnread = !item.readAt;
          return (
            <View
              key={item.id}
              style={[
                styles.notifCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isUnread ? colors.secondaryContainer : colors.border,
                  borderWidth: isUnread ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: colors.surfaceContainer }]}>
                  {getNotificationIcon(item.type)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.subtitle, { color: colors.textPrimary, fontWeight: isUnread ? '700' : '600' }]}>
                    {item.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    {item.createdAt}
                  </Text>
                </View>
                {isUnread && (
                  <View style={[styles.unreadDot, { backgroundColor: colors.secondaryContainer }]} />
                )}
              </View>
              <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 8, lineHeight: 18 }]}>
                {item.message || (item as any).body}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  updatesBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
