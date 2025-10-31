import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/store/AuthContext';
import { NotificationsProvider } from '@/hooks/useNotifications';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="mother-update" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </NotificationsProvider>
    </AuthProvider>
  );
}
