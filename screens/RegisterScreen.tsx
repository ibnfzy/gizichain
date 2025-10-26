import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout, AppSelect, AppTextInput } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { normalizeApiError } from '@/services/api';

const LAKTASI_OPTIONS = [
  { label: 'Eksklusif', value: 'eksklusif' },
  { label: 'Parsial', value: 'parsial' },
];

const AKTIVITAS_OPTIONS = [
  { label: 'Ringan', value: 'ringan' },
  { label: 'Sedang', value: 'sedang' },
  { label: 'Berat', value: 'berat' },
];

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
  const [laktasiTipe, setLaktasiTipe] = useState('eksklusif');
  const [aktivitas, setAktivitas] = useState('ringan');
  const [alergi, setAlergi] = useState('');
  const [preferensi, setPreferensi] = useState('');
  const [riwayatPenyakit, setRiwayatPenyakit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  type FieldErrorUpdate = { keys: string[]; message?: string };

  const updateFieldErrors = (updates: FieldErrorUpdate[]) => {
    setFieldErrors((prev) => {
      const next = { ...prev };

      for (const update of updates) {
        for (const key of update.keys) {
          if (!key) {
            continue;
          }

          if (update.message) {
            next[key] = update.message;
          } else {
            delete next[key];
          }
        }
      }

      return next;
    });
  };

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
    const nameError = !name.trim() ? 'Nama wajib diisi.' : undefined;
    const emailError = !email.trim() ? 'Email wajib diisi.' : undefined;
    const passwordError = !password ? 'Kata sandi wajib diisi.' : undefined;

    let confirmationError = !confirmation
      ? 'Konfirmasi kata sandi wajib diisi.'
      : undefined;

    if (!passwordError && !confirmationError && password !== confirmation) {
      confirmationError = 'Konfirmasi kata sandi tidak cocok.';
    }

    for (const message of [
      nameError,
      emailError,
      passwordError,
      confirmationError,
    ]) {
      if (message) {
        issues.push(message);
      }
    }

    const updates: FieldErrorUpdate[] = [
      {
        keys: ['name', 'user.name'],
        message: nameError,
      },
      {
        keys: ['email', 'user.email'],
        message: emailError,
      },
      {
        keys: ['password', 'user.password'],
        message: passwordError,
      },
      {
        keys: ['password_confirmation', 'user.password_confirmation'],
        message: confirmationError,
      },
    ];

    updateFieldErrors(updates);

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

    const bbError = parsedBb === null ? 'Berat badan (bb) harus berupa angka.' : undefined;
    const tbError = parsedTb === null ? 'Tinggi badan (tb) harus berupa angka.' : undefined;
    const umurError = parsedUmur === null ? 'Umur ibu harus berupa angka.' : undefined;
    const usiaBayiError =
      parsedUsiaBayi === null ? 'Usia bayi (bulan) harus berupa angka.' : undefined;
    const laktasiError = !laktasiTipe.trim()
      ? 'Jenis laktasi wajib diisi.'
      : undefined;
    const aktivitasError = !aktivitas.trim()
      ? 'Tingkat aktivitas wajib diisi.'
      : undefined;

    for (const message of [
      bbError,
      tbError,
      umurError,
      usiaBayiError,
      laktasiError,
      aktivitasError,
    ]) {
      if (message) {
        issues.push(message);
      }
    }

    const updates: FieldErrorUpdate[] = [
      {
        keys: ['bb', 'ibu.bb', 'mother.bb'],
        message: bbError,
      },
      {
        keys: ['tb', 'ibu.tb', 'mother.tb'],
        message: tbError,
      },
      {
        keys: ['umur', 'ibu.umur', 'mother.umur'],
        message: umurError,
      },
      {
        keys: ['usia_bayi_bln', 'ibu.usia_bayi_bln', 'mother.usia_bayi_bln'],
        message: usiaBayiError,
      },
      {
        keys: ['laktasi_tipe', 'ibu.laktasi_tipe', 'mother.laktasi_tipe'],
        message: laktasiError,
      },
      {
        keys: ['aktivitas', 'ibu.aktivitas', 'mother.aktivitas'],
        message: aktivitasError,
      },
    ];

    updateFieldErrors(updates);

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
    setFieldErrors({});
    setError(null);

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
      const apiError = normalizeApiError(err);

      setError(apiError.message);
      setFieldErrors(apiError.fieldErrors ?? {});
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
            <AppTextInput
              placeholder="Nama lengkap"
              value={name}
              onChangeText={setName}
              errorMessage={resolveFieldError('name', 'user.name')}
            />
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
            <AppTextInput
              placeholder="Konfirmasi kata sandi"
              secureTextEntry
              value={confirmation}
              onChangeText={setConfirmation}
              errorMessage={resolveFieldError(
                'password_confirmation',
                'user.password_confirmation'
              )}
            />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <AppTextInput
              keyboardType="numeric"
              placeholder="Berat badan (kg)"
              value={bb}
              onChangeText={setBb}
              errorMessage={resolveFieldError('bb', 'ibu.bb', 'mother.bb')}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Tinggi badan (cm)"
              value={tb}
              onChangeText={setTb}
              errorMessage={resolveFieldError('tb', 'ibu.tb', 'mother.tb')}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Umur ibu"
              value={umur}
              onChangeText={setUmur}
              errorMessage={resolveFieldError('umur', 'ibu.umur', 'mother.umur')}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Usia bayi (bulan)"
              value={usiaBayi}
              onChangeText={setUsiaBayi}
              errorMessage={resolveFieldError(
                'usia_bayi_bln',
                'ibu.usia_bayi_bln',
                'mother.usia_bayi_bln'
              )}
            />
            <AppSelect
              placeholder="Pilih tipe laktasi"
              value={laktasiTipe}
              options={LAKTASI_OPTIONS}
              onValueChange={setLaktasiTipe}
              errorMessage={resolveFieldError(
                'laktasi_tipe',
                'ibu.laktasi_tipe',
                'mother.laktasi_tipe'
              )}
            />
            <AppSelect
              placeholder="Pilih tingkat aktivitas"
              value={aktivitas}
              options={AKTIVITAS_OPTIONS}
              onValueChange={setAktivitas}
              errorMessage={resolveFieldError(
                'aktivitas',
                'ibu.aktivitas',
                'mother.aktivitas'
              )}
            />
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                Isikan daftar dengan memisahkan setiap item menggunakan koma (,).
              </Text>
              <AppTextInput
                placeholder="Alergi (pisahkan dengan koma)"
                value={alergi}
                onChangeText={setAlergi}
                errorMessage={resolveFieldError('alergi', 'ibu.alergi', 'mother.alergi')}
              />
              <AppTextInput
                placeholder="Preferensi makanan (pisahkan dengan koma)"
                value={preferensi}
                onChangeText={setPreferensi}
                errorMessage={resolveFieldError(
                  'preferensi',
                  'ibu.preferensi',
                  'mother.preferensi'
                )}
              />
              <AppTextInput
                placeholder="Riwayat penyakit (pisahkan dengan koma)"
                value={riwayatPenyakit}
                onChangeText={setRiwayatPenyakit}
                errorMessage={resolveFieldError(
                  'riwayat_penyakit',
                  'ibu.riwayat_penyakit',
                  'mother.riwayat_penyakit'
                )}
              />
            </View>
          </View>
        )}
      </View>
    </AuthLayout>
  );
}
