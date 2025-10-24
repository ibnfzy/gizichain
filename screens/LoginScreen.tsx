import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppTextInput } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError('Tidak dapat masuk. Periksa kembali kredensial Anda.');
      console.warn('Login error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-8 py-10">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-brand-green">Selamat Datang</Text>
          <Text className="mt-2 text-base text-gray-600">Masuk untuk memantau status gizi terkini.</Text>
        </View>

        <View className="gap-5">
          <AppTextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <AppTextInput
            placeholder="Kata sandi"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {error ? <Text className="mt-4 text-sm text-rose-500">{error}</Text> : null}

        <View className="mt-8">
          <AppButton label="Masuk" onPress={handleSubmit} loading={submitting} disabled={isLoading} />
        </View>

        <Pressable className="mt-6" onPress={() => router.push('/register')}>
          <Text className="text-center text-sm text-brand-pink">
            Belum punya akun? Daftar sekarang
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
