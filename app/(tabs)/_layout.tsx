import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { colors, spacing } from '@/styles';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar],
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
    height: 64,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
