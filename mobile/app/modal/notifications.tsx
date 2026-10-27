import React, { useState } from 'react';
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
import { INITIAL_NOTIFICATIONS } from '../../src/services/mockData';
import { NotificationItem } from '../../src/types';

export default function NotificationsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii, typography } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BUDGET_WARNING':
        return <AlertTriangle size={18} color={colors.warning} />;
      case 'RECURRING_DUE':
        return <Calendar size={18} color={colors.info} />;
      default:
        return <Receipt size={18} color={colors.accentDark} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Bell size={20} color={colors.textPrimary} />
          <Text style={[typography.title, { color: colors.textPrimary }]}>Notifications</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <X size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Subheader action */}
      <View style={[styles.actionRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {notifications.filter((n) => !n.readAt).length} Unread Notifications
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleMarkAllRead}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <CheckCheck size={14} color={colors.accentDark} />
          <Text style={[typography.caption, { color: colors.accentDark, fontWeight: '700' }]}>
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20, gap: 10 }}
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
                  borderColor: isUnread ? colors.primary : colors.border,
                  borderWidth: isUnread ? 1.5 : 1,
                  borderRadius: radii.lg,
                  padding: spacing.md,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconTitleRow}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.cardSubtle, borderRadius: radii.md }]}>
                    {getNotificationIcon(item.type)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.textPrimary, fontWeight: '700' }]}>
                      {item.title}
                    </Text>
                    <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>

                {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />}
              </View>

              <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 8, lineHeight: 18 }]}>
                {item.message}
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
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifCard: {},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});
