import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, AppTextInput } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { colors, spacing } from '@/styles';

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
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>Masuk untuk memantau status gizi terkini.</Text>
        </View>

        <View style={styles.formFields}>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.submitButtonContainer}>
          <AppButton label="Masuk" onPress={handleSubmit} loading={submitting} disabled={isLoading} />
        </View>

        <Pressable style={styles.linkButton} onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Belum punya akun? Daftar sekarang</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.brandBackground,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.brandGreen,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  formFields: {
    gap: spacing.xl,
  },
  errorText: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.error,
  },
  submitButtonContainer: {
    marginTop: spacing.xxl,
  },
  linkButton: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: colors.brandPink,
  },
});
