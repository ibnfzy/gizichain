import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

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
    <View className="flex-1 items-center justify-center bg-brand-white px-8">
      <View className="items-center justify-center rounded-full bg-brand-green/10 p-12">
        <Image source={require('../assets/images/splash-icon.png')} className="h-32 w-32" resizeMode="contain" />
      </View>
      <Text className="mt-8 text-3xl font-bold text-brand-green">GiziChain</Text>
      <Text className="mt-2 text-center text-base text-gray-600">
        Mendampingi ibu menjaga status gizi secara digital
      </Text>
    </View>
  );
}
