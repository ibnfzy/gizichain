import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { AppButton, AppTextInput, InfoCard } from "@/components/ui";
import { colors, globalStyles, spacing, typography } from "@/styles";

export function ProfileScreen() {
  const [fullName, setFullName] = useState("Siti Aminah");
  const [email, setEmail] = useState("siti.aminah@example.com");
  const [phone, setPhone] = useState("0812 3456 7890");
  const [address, setAddress] = useState("Jl. Mawar No. 12, Bandung");
  const [notes, setNotes] = useState("Tidak ada alergi yang diketahui.");

  const router = useRouter();

  const screenStyle = globalStyles.screen as StyleProp<ViewStyle>;
  const cardStyle = globalStyles.card as StyleProp<ViewStyle>;

  const handleNavigateToMotherUpdate = () => {
    router.push("../mother-update");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={screenStyle}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Profil Ibu</Text>
        <Text style={styles.subtitle}>
          Perbarui data pribadi dan preferensi kesehatan Anda agar rekomendasi
          gizi tetap relevan.
        </Text>

        <InfoCard
          title="Status singkat"
          variant="pastel"
          style={styles.summaryCard}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Kehamilan</Text>
              <Text style={styles.summaryValue}>Trimester 2</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Target Kenaikan BB</Text>
              <Text style={styles.summaryValue}>5,5 kg</Text>
            </View>
          </View>
        </InfoCard>

        <View style={styles.quickAction}>
          <AppButton
            label="Edit Profil Ibu"
            onPress={handleNavigateToMotherUpdate}
            variant="primary"
            style={styles.editButton}
          />
        </View>

        <View style={[cardStyle, styles.formCard]}>
          <Text style={styles.formTitle}>Informasi Dasar</Text>
          <AppTextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nama lengkap"
            style={styles.input}
          />
          <AppTextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <AppTextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Nomor telepon"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <AppTextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Alamat"
            multiline
            style={[styles.input, styles.multiline]}
          />
          <Text style={styles.formTitle}>Catatan Kesehatan</Text>
          <AppTextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Catatan penting untuk bidan/pakar"
            multiline
            style={[styles.input, styles.multiline]}
          />
          <AppButton
            label="Simpan Perubahan"
            variant="pastel"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.xl,
    gap: spacing.xl,
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
  summaryCard: {
    paddingVertical: spacing.xl,
  } as ViewStyle,
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.xxl,
  } as ViewStyle,
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
  summaryValue: {
    marginTop: spacing.xs,
    ...typography.subtitle,
    color: colors.textPrimary,
  } as TextStyle,
  formCard: {
    gap: spacing.md,
  } as ViewStyle,
  quickAction: {
    alignItems: "flex-end",
  } as ViewStyle,
  editButton: {
    width: "auto",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  } as ViewStyle,
  formTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  } as TextStyle,
  input: {
    marginBottom: spacing.md,
  } as TextStyle,
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  } as TextStyle,
  submitButton: {
    marginTop: spacing.lg,
  } as ViewStyle,
});
