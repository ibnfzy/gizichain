import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, AppTextInput } from '@/components/ui';
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
    <AuthLayout
      title="Masuk"
      subtitle="Masuk untuk memantau status gizi terkini."
      submitLabel="Masuk"
      onSubmit={handleSubmit}
      submitLoading={submitting}
      submitDisabled={isLoading}
      linkLabel="Belum punya akun? Daftar sekarang"
      onLinkPress={() => router.push('/register')}
      errorMessage={error}
      heroMessage="Selamat datang kembali!"
      illustration={<Text style={{ fontSize: 38 }}>💫</Text>}
    >
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
    </AuthLayout>
  );
}
