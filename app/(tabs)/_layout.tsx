import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useNotifications } from '@/hooks/useNotifications';
import { colors, spacing } from '@/styles';

const TAB_BAR_BASE_HEIGHT = 64;

export default function TabsLayout() {
  const { countsByType } = useNotifications();
  const insets = useSafeAreaInsets();
  const safePaddingBottom = Math.max(insets.bottom, spacing.sm);
  const tabBarDynamicStyle: ViewStyle = {
    paddingBottom: safePaddingBottom,
    height: TAB_BAR_BASE_HEIGHT - spacing.sm + safePaddingBottom,
  };
  const scheduleBadgeCount =
    (countsByType['schedule-reminder'] ?? 0) + (countsByType['schedule'] ?? 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, tabBarDynamicStyle],
        tabBarLabelStyle: styles.tabLabel,
        tabBarButton: (props) => <HapticTab {...props} />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Rencana',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color, size }) => <Feather name="clock" size={size ?? 22} color={color} />,
          tabBarItemStyle: styles.scheduleItem,
          tabBarLabelStyle: styles.scheduleLabel,
          tabBarBadge: scheduleBadgeCount > 0 ? scheduleBadgeCount : undefined,
          tabBarBadgeStyle: styles.scheduleBadge,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <Feather name="message-circle" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifikasi',
          tabBarIcon: ({ color, size }) => <Feather name="bell" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size ?? 22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    height: TAB_BAR_BASE_HEIGHT,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  } as ViewStyle,
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,
  scheduleItem: {
    backgroundColor: colors.primaryPastel,
    borderRadius: spacing.lg,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  } as ViewStyle,
  scheduleLabel: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  scheduleBadge: {
    backgroundColor: colors.danger,
    color: colors.textInverted,
    fontSize: 11,
    minWidth: 18,
    textAlign: 'center',
  } as TextStyle,
});
