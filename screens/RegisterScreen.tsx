import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, AppTextInput } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [bb, setBb] = useState('');
  const [tb, setTb] = useState('');
  const [umur, setUmur] = useState('');
  const [usiaBayi, setUsiaBayi] = useState('');
  const [laktasiTipe, setLaktasiTipe] = useState('');
  const [aktivitas, setAktivitas] = useState('');
  const [alergi, setAlergi] = useState('');
  const [preferensi, setPreferensi] = useState('');
  const [riwayatPenyakit, setRiwayatPenyakit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseNumberField = (value: string) => {
    if (!value.trim()) {
      return null;
    }

    const normalized = value.replace(',', '.');
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseListField = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const validateStepOne = () => {
    const issues: string[] = [];

    if (!name.trim()) {
      issues.push('Nama wajib diisi.');
    }

    if (!email.trim()) {
      issues.push('Email wajib diisi.');
    }

    if (!password) {
      issues.push('Kata sandi wajib diisi.');
    }

    if (!confirmation) {
      issues.push('Konfirmasi kata sandi wajib diisi.');
    }

    if (password && confirmation && password !== confirmation) {
      issues.push('Konfirmasi kata sandi tidak cocok.');
    }

    if (issues.length > 0) {
      setError(issues.join('\n'));
      return false;
    }

    setError(null);
    return true;
  };

  const validateStepTwo = () => {
    const issues: string[] = [];

    const parsedBb = parseNumberField(bb);
    const parsedTb = parseNumberField(tb);
    const parsedUmur = parseNumberField(umur);
    const parsedUsiaBayi = parseNumberField(usiaBayi);

    if (parsedBb === null) {
      issues.push('Berat badan (bb) harus berupa angka.');
    }

    if (parsedTb === null) {
      issues.push('Tinggi badan (tb) harus berupa angka.');
    }

    if (parsedUmur === null) {
      issues.push('Umur ibu harus berupa angka.');
    }

    if (parsedUsiaBayi === null) {
      issues.push('Usia bayi (bulan) harus berupa angka.');
    }

    if (!laktasiTipe.trim()) {
      issues.push('Jenis laktasi wajib diisi.');
    }

    if (!aktivitas.trim()) {
      issues.push('Tingkat aktivitas wajib diisi.');
    }

    if (issues.length > 0) {
      setError(issues.join('\n'));
      return null;
    }

    setError(null);

    return {
      bb: parsedBb!,
      tb: parsedTb!,
      umur: parsedUmur!,
      usia_bayi_bln: parsedUsiaBayi!,
      laktasi_tipe: laktasiTipe.trim(),
      aktivitas: aktivitas.trim(),
      alergi: parseListField(alergi),
      preferensi: parseListField(preferensi),
      riwayat_penyakit: parseListField(riwayatPenyakit),
    };
  };

  const handleNextStep = () => {
    if (validateStepOne()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    const ibuPayload = validateStepTwo();

    if (!ibuPayload) {
      return;
    }

    setSubmitting(true);

    try {
      await register({
        user: {
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: confirmation,
        },
        ibu: ibuPayload,
      });
      router.replace('/(tabs)/dashboard');
    } catch (err: unknown) {
      setError('Tidak dapat mendaftarkan akun. Silakan coba lagi.');
      console.warn('Register error', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (step === 1) {
      handleNextStep();
      return;
    }

    await handleRegister();
  };

  const handleSecondaryAction = () => {
    if (step === 1) {
      router.back();
      return;
    }

    setStep(1);
    setError(null);
  };

  const isStepOne = step === 1;

  const stepDescription = useMemo(
    () => (isStepOne ? 'Langkah 1 dari 2 — Informasi Akun' : 'Langkah 2 dari 2 — Profil Ibu'),
    [isStepOne],
  );

  return (
    <AuthLayout
      title="Buat Akun"
      subtitle="Daftarkan diri Anda untuk mulai memonitor kebutuhan gizi."
      submitLabel={isStepOne ? 'Lanjutkan' : 'Daftar'}
      onSubmit={handleSubmit}
      submitLoading={submitting}
      submitDisabled={isLoading || submitting}
      linkLabel={isStepOne ? 'Sudah punya akun? Masuk di sini' : 'Kembali ke informasi akun'}
      onLinkPress={handleSecondaryAction}
      errorMessage={error}
      heroMessage="Mari mulai perjalanan sehat Anda!"
      illustration={<Text style={{ fontSize: 38 }}>🌿</Text>}
    >
      <View style={{ gap: 16 }}>
        <Text style={{ textAlign: 'center', fontWeight: '600' }}>{stepDescription}</Text>
        {isStepOne ? (
          <View style={{ gap: 16 }}>
            <AppTextInput placeholder="Nama lengkap" value={name} onChangeText={setName} />
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
            <AppTextInput
              placeholder="Konfirmasi kata sandi"
              secureTextEntry
              value={confirmation}
              onChangeText={setConfirmation}
            />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <AppTextInput
              keyboardType="numeric"
              placeholder="Berat badan (kg)"
              value={bb}
              onChangeText={setBb}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Tinggi badan (cm)"
              value={tb}
              onChangeText={setTb}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Umur ibu"
              value={umur}
              onChangeText={setUmur}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Usia bayi (bulan)"
              value={usiaBayi}
              onChangeText={setUsiaBayi}
            />
            <AppTextInput
              placeholder="Tipe laktasi"
              value={laktasiTipe}
              onChangeText={setLaktasiTipe}
            />
            <AppTextInput
              placeholder="Tingkat aktivitas"
              value={aktivitas}
              onChangeText={setAktivitas}
            />
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Isikan daftar dengan memisahkan setiap item menggunakan koma (,).
              </Text>
              <AppTextInput
                placeholder="Alergi (pisahkan dengan koma)"
                value={alergi}
                onChangeText={setAlergi}
              />
              <AppTextInput
                placeholder="Preferensi makanan (pisahkan dengan koma)"
                value={preferensi}
                onChangeText={setPreferensi}
              />
              <AppTextInput
                placeholder="Riwayat penyakit (pisahkan dengan koma)"
                value={riwayatPenyakit}
                onChangeText={setRiwayatPenyakit}
              />
            </View>
          </View>
        )}
      </View>
    </AuthLayout>
  );
}
