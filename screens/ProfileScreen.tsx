import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { AppButton, AppSelect, AppTextInput } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import {
  MotherProfileUpdatePayload,
  getMotherProfile,
  normalizeApiError,
  updateMotherProfile,
} from "@/services/api";
import { colors, globalStyles, spacing, typography } from "@/styles";

const LAKTASI_OPTIONS = [
  { label: "Eksklusif", value: "eksklusif" },
  { label: "Parsial", value: "parsial" },
];

const AKTIVITAS_OPTIONS = [
  { label: "Ringan", value: "ringan" },
  { label: "Sedang", value: "sedang" },
  { label: "Berat", value: "berat" },
];

type FieldErrorUpdate = { keys: string[]; message?: string };

export function ProfileScreen() {
  const { motherId, user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bb, setBb] = useState("");
  const [tb, setTb] = useState("");
  const [umur, setUmur] = useState("");
  const [usiaBayi, setUsiaBayi] = useState("");
  const [laktasiTipe, setLaktasiTipe] = useState("eksklusif");
  const [aktivitas, setAktivitas] = useState("ringan");
  const [alergi, setAlergi] = useState("");
  const [preferensi, setPreferensi] = useState("");
  const [riwayat, setRiwayat] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const screenStyle = globalStyles.screen as ViewStyle;

  const updateFieldErrors = useCallback((updates: FieldErrorUpdate[]) => {
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
  }, []);

  const resolveFieldError = useCallback(
    (...keys: Array<string | undefined>): string | undefined => {
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
    },
    [fieldErrors]
  );

  const parseNumberField = useCallback((value: string) => {
    if (!value.trim()) {
      return null;
    }

    const normalized = value.replace(",", ".");
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }, []);

  const parseListField = useCallback(
    (value: string) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    []
  );

  const loadProfile = useCallback(
    async (targetMotherId: string | number) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setFieldErrors({});

      try {
        const profile = await getMotherProfile(targetMotherId);
        const resolvedRiwayat = profile.riwayat ?? profile.riwayat_penyakit;

        setName(profile.name ?? user?.name ?? "");
        setEmail(profile.email ?? user?.email ?? "");
        setPassword("");
        setBb(String(profile.bb ?? ""));
        setTb(String(profile.tb ?? ""));
        setUmur(String(profile.umur ?? ""));
        setUsiaBayi(String(profile.usia_bayi_bln ?? ""));
        setLaktasiTipe(profile.laktasi_tipe ?? "eksklusif");
        setAktivitas(profile.aktivitas ?? "ringan");
        setAlergi(profile.alergi.join(", "));
        setPreferensi(profile.preferensi.join(", "));
        setRiwayat((resolvedRiwayat ?? []).join(", "));
      } catch (err) {
        const apiError = normalizeApiError(err);
        setError(apiError.message);
        setFieldErrors(apiError.fieldErrors ?? {});
      } finally {
        setLoading(false);
      }
    },
    [user?.email, user?.name]
  );

  useEffect(() => {
    if (!motherId) {
      setError("Profil ibu tidak tersedia.");
      setLoading(false);
      return;
    }

    loadProfile(motherId);
  }, [loadProfile, motherId]);

  const motherPayload = useCallback((): MotherProfileUpdatePayload | null => {
    const issues: string[] = [];

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const parsedBb = parseNumberField(bb);
    const parsedTb = parseNumberField(tb);
    const parsedUmur = parseNumberField(umur);
    const parsedUsiaBayi = parseNumberField(usiaBayi);

    const nameError = !trimmedName ? "Nama wajib diisi." : undefined;
    const emailError = !trimmedEmail
      ? "Email wajib diisi."
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ? undefined
        : "Format email tidak valid.";
    const passwordError = trimmedPassword && trimmedPassword.length < 8
      ? "Password minimal 8 karakter."
      : undefined;
    const bbError = parsedBb === null ? "Berat badan (bb) harus berupa angka." : undefined;
    const tbError = parsedTb === null ? "Tinggi badan (tb) harus berupa angka." : undefined;
    const umurError = parsedUmur === null ? "Umur ibu harus berupa angka." : undefined;
    const usiaBayiError =
      parsedUsiaBayi === null ? "Usia bayi (bulan) harus berupa angka." : undefined;
    const laktasiError = !laktasiTipe.trim()
      ? "Jenis laktasi wajib diisi."
      : undefined;
    const aktivitasError = !aktivitas.trim()
      ? "Tingkat aktivitas wajib diisi."
      : undefined;

    for (const message of [
      nameError,
      emailError,
      passwordError,
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
      { keys: ["name", "user.name"], message: nameError },
      { keys: ["email", "user.email"], message: emailError },
      { keys: ["password", "user.password"], message: passwordError },
      { keys: ["bb", "mother.bb"], message: bbError },
      { keys: ["tb", "mother.tb"], message: tbError },
      { keys: ["umur", "mother.umur"], message: umurError },
      {
        keys: ["usia_bayi_bln", "mother.usia_bayi_bln"],
        message: usiaBayiError,
      },
      {
        keys: ["laktasi_tipe", "mother.laktasi_tipe"],
        message: laktasiError,
      },
      { keys: ["aktivitas", "mother.aktivitas"], message: aktivitasError },
    ];

    updateFieldErrors(updates);

    if (issues.length > 0) {
      setError(issues.join("\n"));
      return null;
    }

    setError(null);

    const parsedRiwayat = parseListField(riwayat);

    const payload: MotherProfileUpdatePayload = {
      name: trimmedName,
      email: trimmedEmail,
      bb: parsedBb!,
      tb: parsedTb!,
      umur: parsedUmur!,
      usia_bayi_bln: parsedUsiaBayi!,
      laktasi_tipe: laktasiTipe.trim(),
      aktivitas: aktivitas.trim(),
      alergi: parseListField(alergi),
      preferensi: parseListField(preferensi),
      riwayat: parsedRiwayat,
      riwayat_penyakit: parsedRiwayat,
    };

    if (trimmedPassword) {
      payload.password = trimmedPassword;
    }

    return payload;
  }, [
    aktivitas,
    alergi,
    bb,
    email,
    laktasiTipe,
    name,
    parseListField,
    parseNumberField,
    password,
    preferensi,
    riwayat,
    umur,
    updateFieldErrors,
    usiaBayi,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!motherId) {
      setError("Profil ibu tidak tersedia.");
      return;
    }

    const payload = motherPayload();

    if (!payload) {
      return;
    }

    setSubmitting(true);
    setSuccess(null);
    setFieldErrors({});

    try {
      const updatedProfile = await updateMotherProfile(motherId, payload);
      const resolvedRiwayat =
        updatedProfile.riwayat ?? updatedProfile.riwayat_penyakit;

      setSuccess("Profil ibu berhasil diperbarui.");
      setPassword("");
      setBb(String(updatedProfile.bb ?? ""));
      setTb(String(updatedProfile.tb ?? ""));
      setUmur(String(updatedProfile.umur ?? ""));
      setUsiaBayi(String(updatedProfile.usia_bayi_bln ?? ""));
      setLaktasiTipe(updatedProfile.laktasi_tipe ?? "eksklusif");
      setAktivitas(updatedProfile.aktivitas ?? "ringan");
      setAlergi(updatedProfile.alergi.join(", "));
      setPreferensi(updatedProfile.preferensi.join(", "));
      setRiwayat((resolvedRiwayat ?? []).join(", "));

      const resolvedName =
        updatedProfile.name ?? payload.name ?? name.trim();
      const resolvedEmail =
        updatedProfile.email ?? payload.email ?? email.trim();

      if (user) {
        setUser({ ...user, name: resolvedName, email: resolvedEmail });
      } else {
        setName(resolvedName);
        setEmail(resolvedEmail);
      }
    } catch (err) {
      const apiError = normalizeApiError(err);
      setError(apiError.message);
      setFieldErrors(apiError.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  }, [
    email,
    motherId,
    motherPayload,
    name,
    setUser,
    user,
  ]);

  const helperText = useMemo(
    () => "Isikan daftar dengan memisahkan setiap item menggunakan koma (,).",
    []
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={screenStyle}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profil Ibu</Text>
        <Text style={styles.subtitle}>
          Perbarui data pribadi dan preferensi kesehatan agar rekomendasi gizi tetap relevan.
        </Text>

        {success ? (
          <View style={[styles.alert, styles.successAlert]}>
            <Text style={styles.alertText}>{success}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.alert, styles.errorAlert]}>
            <Text style={styles.alertText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={[globalStyles.card as ViewStyle, styles.formCard]}>
            <Text style={styles.formSectionTitle}>Informasi Akun</Text>
            <AppTextInput
              placeholder="Nama lengkap"
              value={name}
              onChangeText={setName}
              errorMessage={resolveFieldError("name", "user.name")}
            />
            <AppTextInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              errorMessage={resolveFieldError("email", "user.email")}
            />
            <AppTextInput
              placeholder="Password baru (opsional)"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              errorMessage={resolveFieldError("password", "user.password")}
            />

            <Text style={styles.formSectionTitle}>Informasi Dasar</Text>
            <AppTextInput
              keyboardType="numeric"
              placeholder="Berat badan (kg)"
              value={bb}
              onChangeText={setBb}
              errorMessage={resolveFieldError("bb", "mother.bb")}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Tinggi badan (cm)"
              value={tb}
              onChangeText={setTb}
              errorMessage={resolveFieldError("tb", "mother.tb")}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Umur ibu"
              value={umur}
              onChangeText={setUmur}
              errorMessage={resolveFieldError("umur", "mother.umur")}
            />
            <AppTextInput
              keyboardType="numeric"
              placeholder="Usia bayi (bulan)"
              value={usiaBayi}
              onChangeText={setUsiaBayi}
              errorMessage={resolveFieldError(
                "usia_bayi_bln",
                "mother.usia_bayi_bln"
              )}
            />
            <AppSelect
              placeholder="Pilih tipe laktasi"
              value={laktasiTipe}
              options={LAKTASI_OPTIONS}
              onValueChange={setLaktasiTipe}
              errorMessage={resolveFieldError(
                "laktasi_tipe",
                "mother.laktasi_tipe"
              )}
            />
            <AppSelect
              placeholder="Pilih tingkat aktivitas"
              value={aktivitas}
              options={AKTIVITAS_OPTIONS}
              onValueChange={setAktivitas}
              errorMessage={resolveFieldError(
                "aktivitas",
                "mother.aktivitas"
              )}
            />

            <View style={styles.helperContainer}>
              <Text style={styles.helperText}>{helperText}</Text>
              <AppTextInput
                placeholder="Alergi (pisahkan dengan koma)"
                value={alergi}
                onChangeText={setAlergi}
                errorMessage={resolveFieldError(
                  "alergi",
                  "mother.alergi"
                )}
              />
              <AppTextInput
                placeholder="Preferensi makanan (pisahkan dengan koma)"
                value={preferensi}
                onChangeText={setPreferensi}
                errorMessage={resolveFieldError(
                  "preferensi",
                  "mother.preferensi"
                )}
              />
              <AppTextInput
                placeholder="Riwayat kesehatan (pisahkan dengan koma)"
                value={riwayat}
                onChangeText={setRiwayat}
                errorMessage={resolveFieldError(
                  "riwayat",
                  "riwayat_penyakit",
                  "mother.riwayat",
                  "mother.riwayat_penyakit"
                )}
              />
            </View>

            <AppButton
              label="Simpan Perubahan"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  } as ViewStyle,
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
  } as TextStyle,
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  } as TextStyle,
  alert: {
    borderRadius: 12,
    padding: spacing.md,
  } as ViewStyle,
  successAlert: {
    backgroundColor: colors.mintPastel,
  } as ViewStyle,
  errorAlert: {
    backgroundColor: colors.dangerPastel,
  } as ViewStyle,
  alertText: {
    ...typography.caption,
    color: colors.textPrimary,
  } as TextStyle,
  loaderContainer: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  formCard: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  } as ViewStyle,
  formSectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  } as TextStyle,
  helperContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  } as ViewStyle,
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
});

