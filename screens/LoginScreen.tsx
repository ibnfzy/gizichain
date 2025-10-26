import { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, AppTextInput } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { normalizeApiError } from '@/services/api';

export function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resolveFieldError = (
    ...keys: Array<string | undefined>
  ): string | undefined => {
    for (const key of keys) {
      if (!key) {
        continue;
      }

      const message = fieldErrors[key];

      if (message) {
        return message;
      }
    }

    return undefined;
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      const nextFieldErrors: Record<string, string> = {};
      const issues: string[] = [];

      if (!email) {
        const message = 'Email wajib diisi.';
        nextFieldErrors.email = message;
        issues.push(message);
      }

      if (!password) {
        const message = 'Kata sandi wajib diisi.';
        nextFieldErrors.password = message;
        issues.push(message);
      }

      setFieldErrors(nextFieldErrors);
      setError(issues.join('\n') || 'Email dan kata sandi wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      await login({ email, password });
      router.replace('/(tabs)/dashboard');
    } catch (err: unknown) {
      const apiError = normalizeApiError(err);

      setError(apiError.message);
      setFieldErrors(apiError.fieldErrors ?? {});
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
        errorMessage={resolveFieldError('email', 'user.email')}
      />
      <AppTextInput
        placeholder="Kata sandi"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        errorMessage={resolveFieldError('password', 'user.password')}
      />
    </AuthLayout>
  );
}
