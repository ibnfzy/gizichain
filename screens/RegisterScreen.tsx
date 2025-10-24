import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, AppTextInput } from '@/components/ui';
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
      router.replace('/(tabs)/dashboard');
    } catch (err: unknown) {
      setError('Tidak dapat mendaftarkan akun. Silakan coba lagi.');
      console.warn('Register error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Buat Akun"
      subtitle="Daftarkan diri Anda untuk mulai memonitor kebutuhan gizi."
      submitLabel="Daftar"
      onSubmit={handleSubmit}
      submitLoading={submitting}
      submitDisabled={isLoading}
      linkLabel="Sudah punya akun? Masuk di sini"
      onLinkPress={() => router.back()}
      errorMessage={error}
      heroMessage="Mari mulai perjalanan sehat Anda!"
      illustration={<Text style={{ fontSize: 38 }}>🌿</Text>}
    >
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
    </AuthLayout>
  );
}
