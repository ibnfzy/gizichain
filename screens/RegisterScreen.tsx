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
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>
            Daftarkan diri Anda untuk mulai memonitor kebutuhan gizi.
          </Text>
        </View>

        <View style={styles.formFields}>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.submitButtonContainer}>
          <AppButton label="Daftar" onPress={handleSubmit} loading={submitting} disabled={isLoading} />
        </View>

        <Pressable style={styles.linkButton} onPress={() => router.back()}>
          <Text style={styles.linkText}>Sudah punya akun? Masuk di sini</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  formFields: {
    gap: spacing.xl,
  },
  errorText: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.danger,
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
    color: colors.secondary,
  },
});
