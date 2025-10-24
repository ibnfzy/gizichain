import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/styles';

export function SplashScreen() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timeout = setTimeout(() => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isLoading, router, user]);

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Image source={require('../assets/images/splash-icon.png')} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.title}>GiziChain</Text>
      <Text style={styles.subtitle}>Mendampingi ibu menjaga status gizi secara digital</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: colors.primaryTint,
    padding: spacing.xxxxl,
  },
  icon: {
    width: 128,
    height: 128,
  },
  title: {
    marginTop: spacing.xxxl,
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
});
