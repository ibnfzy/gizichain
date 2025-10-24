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
import { AppTextInput } from '@/components/ui/AppTextInput';
import { AppButton } from '@/components/ui/AppButton';
import { useAuth } from '@/hooks/useAuth';

export function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmation) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    if (password !== confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: confirmation,
      });
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError('Tidak dapat mendaftarkan akun. Silakan coba lagi.');
      console.warn('Register error', err);
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
          <Text className="text-3xl font-bold text-brand-green">Buat Akun</Text>
          <Text className="mt-2 text-base text-gray-600">
            Daftarkan diri Anda untuk mulai memonitor kebutuhan gizi.
          </Text>
        </View>

        <View className="gap-5">
          <AppTextInput placeholder="Nama lengkap" value={name} onChangeText={setName} />
          <AppTextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <AppTextInput placeholder="Kata sandi" secureTextEntry value={password} onChangeText={setPassword} />
          <AppTextInput
            placeholder="Konfirmasi kata sandi"
            secureTextEntry
            value={confirmation}
            onChangeText={setConfirmation}
          />
        </View>

        {error ? <Text className="mt-4 text-sm text-rose-500">{error}</Text> : null}

        <View className="mt-8">
          <AppButton label="Daftar" onPress={handleSubmit} loading={submitting} disabled={isLoading} />
        </View>

        <Pressable className="mt-6" onPress={() => router.back()}>
          <Text className="text-center text-sm text-brand-pink">Sudah punya akun? Masuk di sini</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
