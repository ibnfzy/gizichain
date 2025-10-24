import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton, InfoCard } from '@/components/ui';
import { colors, globalStyles, spacing, typography } from '@/styles';

type NotificationType = 'reminder' | 'warning' | 'insight';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Waktunya timbang berat badan',
    message: 'Jangan lupa catat berat badan hari ini agar tren tetap terpantau.',
    time: 'Hari ini · 07.00',
    type: 'reminder',
  },
  {
    id: '2',
    title: 'Asupan zat besi menurun',
    message: 'Tambahkan sumber zat besi seperti daging merah atau kacang panjang minggu ini.',
    time: 'Kemarin · 19.45',
    type: 'warning',
  },
  {
    id: '3',
    title: 'Rekomendasi menu baru',
    message: 'Coba resep sup bayam jagung untuk makan siang besok.',
    time: 'Kemarin · 09.12',
    type: 'insight',
  },
];

const TYPE_STYLES: Record<NotificationType, { accent: string; background: string }> = {
  reminder: {
    accent: colors.primary,
    background: colors.primaryPastel,
  },
  warning: {
    accent: colors.danger,
    background: colors.dangerPastel,
  },
  insight: {
    accent: colors.secondary,
    background: colors.secondaryPastel,
  },
};

export function NotificationsScreen() {
  return (
    <View style={globalStyles.screen}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Notifikasi</Text>
        <Text style={styles.subtitle}>
          Sorotan notifikasi dibedakan dengan aksen warna lembut agar mudah dibaca dan dipilah.
        </Text>

        <InfoCard title="Ringkasan hari ini" variant="info" style={styles.summaryCard}>
          <Text style={styles.summaryText}>Anda memiliki 1 tugas penting dan 2 rekomendasi terbaru.</Text>
        </InfoCard>

        <View style={styles.listContainer}>
          {NOTIFICATIONS.map((item) => {
            const style = TYPE_STYLES[item.type];
            return (
              <View
                key={item.id}
                style={[styles.notificationCard, { backgroundColor: style.background }]}
              >
                <View style={[styles.accentBar, { backgroundColor: style.accent }]} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <AppButton label="Tandai semua sudah dibaca" variant="outline" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  summaryCard: {
    borderRadius: spacing.lg,
  },
  summaryText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  listContainer: {
    gap: spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    borderRadius: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  accentBar: {
    width: 4,
    borderRadius: spacing.sm,
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  notificationTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
