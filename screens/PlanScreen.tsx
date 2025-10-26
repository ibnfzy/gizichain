import { ScrollView, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { AppButton, InfoCard } from '@/components/ui';
import { colors, globalStyles, spacing, typography } from '@/styles';

const WEEKLY_PLAN = [
  {
    day: 'Senin',
    focus: 'Energi seimbang',
    highlight: 'Karbo kompleks',
    meals: ['Sarapan: Oat dengan buah beri', 'Makan siang: Nasi merah & ayam kukus', 'Camilan: Alpukat & yoghurt'],
    background: colors.primaryPastel,
    accent: colors.primary,
  },
  {
    day: 'Selasa',
    focus: 'Protein berkualitas',
    highlight: 'Ikan laut',
    meals: ['Sarapan: Telur orak arik bayam', 'Makan siang: Pepes ikan + sayur bening', 'Camilan: Edamame kukus'],
    background: colors.mintPastel,
    accent: '#3ba378',
  },
  {
    day: 'Rabu',
    focus: 'Serat tinggi',
    highlight: 'Sayur hijau',
    meals: ['Sarapan: Smoothie kale & pisang', 'Makan siang: Gado-gado dengan tempe', 'Camilan: Buah naga'],
    background: colors.lavenderPastel,
    accent: colors.pastelTitle,
  },
  {
    day: 'Kamis',
    focus: 'Zat besi',
    highlight: 'Kacang-kacangan',
    meals: ['Sarapan: Bubur kacang hijau', 'Makan siang: Sup daging & wortel', 'Camilan: Kurma & kacang almond'],
    background: colors.secondaryPastel,
    accent: colors.secondary,
  },
  {
    day: 'Jumat',
    focus: 'Hidrasi optimal',
    highlight: 'Buah segar',
    meals: ['Sarapan: Chia pudding jeruk', 'Makan siang: Salad quinoa & melon', 'Camilan: Infused water stroberi'],
    background: colors.skyPastel,
    accent: '#3c76b7',
  },
];

export function PlanScreen() {
  return (
    <View style={globalStyles.screen}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Rencana Gizi Mingguan</Text>
        <Text style={styles.subtitle}>
          Setiap kartu merekomendasikan kombinasi menu bernutrisi dengan warna pastel berbeda agar mudah
          dibedakan pada layar 6–7 inci.
        </Text>

        <InfoCard title="Catatan ahli" variant="info" style={styles.infoCard}>
          <Text style={styles.infoText}>
            Sesuaikan porsi dengan anjuran bidan dan pastikan asupan cairan minimal 2 liter per hari.
          </Text>
        </InfoCard>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {WEEKLY_PLAN.map((plan) => (
            <View
              key={plan.day}
              style={[styles.planCard, { backgroundColor: plan.background, borderColor: plan.accent }]}
            >
              <Text style={styles.planDay}>{plan.day}</Text>
              <Text style={styles.planFocus}>{plan.focus}</Text>
              <Text style={styles.planHighlight}>Fokus: {plan.highlight}</Text>
              <View style={styles.mealList}>
                {plan.meals.map((item) => (
                  <Text key={item} style={styles.mealItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>

        <AppButton
          label="Unduh Jadwal Mingguan"
          variant="secondary"
          style={styles.downloadButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
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
  infoCard: {
    borderRadius: spacing.lg,
  } as ViewStyle,
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
  } as TextStyle,
  horizontalList: {
    paddingRight: spacing.xl,
    gap: spacing.lg,
  } as ViewStyle,
  planCard: {
    width: 240,
    borderRadius: spacing.lg,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as ViewStyle,
  planDay: {
    ...typography.subtitle,
    color: colors.textPrimary,
  } as TextStyle,
  planFocus: {
    marginTop: spacing.xs,
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  } as TextStyle,
  planHighlight: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
  mealList: {
    marginTop: spacing.md,
    gap: spacing.xs,
  } as ViewStyle,
  mealItem: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 20,
  } as TextStyle,
  downloadButton: {
    alignSelf: 'center',
    width: '90%',
  } as ViewStyle,
});
