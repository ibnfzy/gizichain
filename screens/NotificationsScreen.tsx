import { useCallback, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { AppButton, InfoCard } from '@/components/ui';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/services/notification';
import { colors, globalStyles, spacing, typography } from '@/styles';

const resolveNotificationType = (notification: Notification): string => {
  const rawType =
    (notification as Record<string, unknown>).type ??
    (notification as Record<string, unknown>).notification_type ??
    (notification as Record<string, unknown>).category ??
    (notification as Record<string, unknown>).kind ??
    (typeof (notification as Record<string, unknown>).data === 'object' &&
    (notification as Record<string, unknown>).data !== null
      ? (notification as { data?: { type?: string } }).data?.type
      : undefined);

  return typeof rawType === 'string' ? rawType.toLowerCase().replace(/_/g, '-') : 'reminder';
};

const NOTIFICATION_STYLES: Record<string, { accent: string; background: string }> = {
  'schedule-reminder': {
    accent: colors.secondary,
    background: colors.secondaryPastel,
  },
  schedule: {
    accent: colors.secondary,
    background: colors.secondaryPastel,
  },
  warning: {
    accent: colors.danger,
    background: colors.dangerPastel,
  },
  insight: {
    accent: colors.secondary,
    background: colors.accentTint,
  },
  reminder: {
    accent: colors.primary,
    background: colors.primaryPastel,
  },
  general: {
    accent: colors.primary,
    background: colors.primaryPastel,
  },
};

const formatNotificationTime = (value?: string) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export function NotificationsScreen() {
  const { notifications, loading, refreshing, error, refresh, markAsRead, countsByType } =
    useNotifications();
  const screenStyle = globalStyles.screen as StyleProp<ViewStyle>;

  const totalUnread = notifications.length;
  const scheduleReminderCount = countsByType['schedule-reminder'] ?? 0;

  const summaryDescription = useMemo(() => {
    if (loading && totalUnread === 0) {
      return 'Memuat notifikasi terbaru...';
    }

    if (totalUnread === 0) {
      return 'Tidak ada notifikasi baru. Anda sudah membaca semuanya.';
    }

    const parts: string[] = [];

    if (scheduleReminderCount > 0) {
      parts.push(`${scheduleReminderCount} pengingat jadwal`);
    }

    const otherUnread = totalUnread - scheduleReminderCount;

    if (otherUnread > 0) {
      parts.push(`${otherUnread} notifikasi lainnya`);
    }

    const joined = parts.join(' dan ');

    return `Anda memiliki ${joined || `${totalUnread} notifikasi`} belum dibaca.`;
  }, [loading, scheduleReminderCount, totalUnread]);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  const handleMarkAllRead = useCallback(() => {
    if (notifications.length === 0) {
      return;
    }

    void Promise.all(notifications.map((notification) => markAsRead(notification)));
  }, [markAsRead, notifications]);

  const handleMarkSingle = useCallback(
    (notificationId: string | number) => {
      void markAsRead(notificationId);
    },
    [markAsRead],
  );

  return (
    <View style={screenStyle}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.title}>Notifikasi</Text>
        <Text style={styles.subtitle}>
          Notifikasi terbaru ditampilkan secara otomatis dan dibedakan berdasarkan kategorinya.
        </Text>

        <InfoCard title="Ringkasan hari ini" variant="info" style={styles.summaryCard}>
          <Text style={styles.summaryText}>{summaryDescription}</Text>
        </InfoCard>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.listContainer}>
          {loading && totalUnread === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Memuat notifikasi...</Text>
              <Text style={styles.emptySubtitle}>
                Mohon tunggu sesaat, kami sedang menyiapkan daftar terbaru.
              </Text>
            </View>
          ) : null}

          {!loading && totalUnread === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Tidak ada notifikasi baru</Text>
              <Text style={styles.emptySubtitle}>
                Semua notifikasi sudah dibaca. Tarik ke bawah untuk memeriksa pembaruan terbaru.
              </Text>
            </View>
          ) : null}

          {notifications.map((notification) => {
            const type = resolveNotificationType(notification);
            const style = NOTIFICATION_STYLES[type] ?? NOTIFICATION_STYLES.general;
            const timestamp = formatNotificationTime(notification.created_at);

            return (
              <View
                key={notification.id}
                style={[styles.notificationCard, { backgroundColor: style.background }]}
              >
                <View style={[styles.accentBar, { backgroundColor: style.accent }]} />
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {String(notification.title ?? 'Notifikasi')}
                  </Text>
                  {notification.message ? (
                    <Text style={styles.notificationMessage}>
                      {String(notification.message)}
                    </Text>
                  ) : null}
                  {timestamp ? <Text style={styles.notificationTime}>{timestamp}</Text> : null}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => handleMarkSingle(notification.id)}
                    style={styles.markReadButton}
                  >
                    <Text style={styles.markReadText}>Tandai sudah dibaca</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <AppButton
          label="Tandai semua sudah dibaca"
          variant="outline"
          onPress={handleMarkAllRead}
          disabled={notifications.length === 0}
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
  summaryCard: {
    borderRadius: spacing.lg,
  } as ViewStyle,
  summaryText: {
    ...typography.body,
    color: colors.textPrimary,
  } as TextStyle,
  errorText: {
    ...typography.body,
    color: colors.danger,
  } as TextStyle,
  listContainer: {
    gap: spacing.md,
  } as ViewStyle,
  emptyState: {
    borderRadius: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.card,
    alignItems: 'flex-start',
    gap: spacing.sm,
  } as ViewStyle,
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  } as TextStyle,
  emptySubtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  } as TextStyle,
  notificationCard: {
    flexDirection: 'row',
    borderRadius: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  } as ViewStyle,
  accentBar: {
    width: 4,
    borderRadius: spacing.sm,
    marginRight: spacing.md,
  } as ViewStyle,
  notificationContent: {
    flex: 1,
    gap: spacing.xs,
  } as ViewStyle,
  notificationTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  } as TextStyle,
  notificationMessage: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  } as TextStyle,
  notificationTime: {
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
  markReadButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.card,
  } as ViewStyle,
  markReadText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
  } as TextStyle,
});
