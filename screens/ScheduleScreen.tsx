import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '@/hooks/useAuth';
import { AttendancePayload, AttendanceStatus, Schedule, getSchedules, setAttendance } from '@/services/schedule';
import { colors, globalStyles, spacing, typography } from '@/styles';

type FullSchedule = Schedule & {
  status?: string;
  attendance?: AttendanceStatus | null;
  evaluation_json?: unknown;
  evaluationJson?: unknown;
};

type EvaluationRecord = Record<string, unknown>;

const parseEvaluation = (input: unknown): EvaluationRecord | null => {
  if (!input) {
    return null;
  }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return typeof parsed === 'object' && parsed !== null ? (parsed as EvaluationRecord) : null;
    } catch (error) {
      console.warn('Failed to parse evaluation_json', error);
      return null;
    }
  }

  if (typeof input === 'object') {
    return input as EvaluationRecord;
  }

  return null;
};

const formatScheduleDate = (value?: string) => {
  if (!value) {
    return 'Jadwal belum ditentukan';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
};

const shouldShowActions = (schedule: FullSchedule) => {
  return (
    (schedule.status === 'scheduled' || schedule.status === 'Scheduled') &&
    (schedule.attendance === 'pending' || !schedule.attendance)
  );
};

export function ScheduleScreen() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<FullSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const motherId = user?.id;

  const fetchSchedules = useCallback(async () => {
    if (!motherId) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getSchedules(motherId);
      setSchedules(data as FullSchedule[]);
    } catch (err: unknown) {
      console.warn('Failed to fetch schedules', err);
      setError('Tidak dapat memuat jadwal. Tarik ke bawah untuk mencoba lagi.');
    } finally {
      setLoading(false);
    }
  }, [motherId]);

  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
    }, [fetchSchedules]),
  );

  useEffect(() => {
    if (!motherId) {
      setSchedules([]);
    }
  }, [motherId]);

  const handleRefresh = useCallback(async () => {
    if (!motherId) {
      return;
    }

    try {
      setRefreshing(true);
      await fetchSchedules();
    } finally {
      setRefreshing(false);
    }
  }, [fetchSchedules, motherId]);

  const handleAttendance = useCallback(
    async (scheduleId: string | number, payload: AttendancePayload) => {
      setUpdatingId(scheduleId);
      setError(null);

      try {
        const updated = await setAttendance(scheduleId, payload);
        setSchedules((previous) =>
          previous.map((item) => (item.id === updated.id ? ({ ...item, ...updated } as FullSchedule) : item)),
        );
      } catch (err: unknown) {
        console.warn('Failed to update attendance', err);
        setError('Tidak dapat memperbarui kehadiran. Coba lagi sebentar lagi.');
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const content = useMemo(() => {
    if (!motherId) {
      return <Text style={styles.emptyState}>Masuk untuk melihat jadwal konsultasi Anda.</Text>;
    }

    if (loading && schedules.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat jadwal...</Text>
        </View>
      );
    }

    if (schedules.length === 0) {
      return <Text style={styles.emptyState}>Belum ada jadwal terjadwal. Tetap pantau informasi terbaru.</Text>;
    }

    return (
      <View style={styles.listContainer}>
        {schedules.map((schedule) => {
          const evaluation =
            schedule.status === 'completed' ? parseEvaluation(schedule.evaluation_json ?? schedule.evaluationJson) : null;

          return (
            <View key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.scheduleTitle}>{schedule.title ?? 'Pertemuan Konsultasi'}</Text>
                <Text style={styles.scheduleTime}>{formatScheduleDate(schedule.scheduledAt as string | undefined)}</Text>
              </View>

              {schedule.description ? <Text style={styles.scheduleDescription}>{schedule.description}</Text> : null}

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Status:</Text>
                <Text style={styles.metaValue}>{schedule.status ? String(schedule.status) : 'Menunggu konfirmasi'}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Kehadiran:</Text>
                <Text style={styles.metaValue}>
                  {schedule.attendance ? String(schedule.attendance) : 'Belum ditandai'}
                </Text>
              </View>

              {shouldShowActions(schedule) ? (
                <View style={styles.actionsRow}>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.actionButton, styles.presentButton]}
                    onPress={() => handleAttendance(schedule.id, { status: 'present' })}
                    disabled={updatingId === schedule.id}
                  >
                    {updatingId === schedule.id ? (
                      <ActivityIndicator color={colors.card} />
                    ) : (
                      <Text style={styles.actionButtonLabel}>Konfirmasi Hadir</Text>
                    )}
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    style={[styles.actionButton, styles.absentButton]}
                    onPress={() => handleAttendance(schedule.id, { status: 'absent' })}
                    disabled={updatingId === schedule.id}
                  >
                    {updatingId === schedule.id ? (
                      <ActivityIndicator color={colors.card} />
                    ) : (
                      <Text style={styles.actionButtonLabel}>Tidak Bisa Hadir</Text>
                    )}
                  </Pressable>
                </View>
              ) : null}

              {evaluation ? (
                <View style={styles.evaluationCard}>
                  <Text style={styles.evaluationTitle}>Catatan Evaluasi</Text>
                  {Object.entries(evaluation).map(([key, value]) => (
                    <View key={key} style={styles.evaluationRow}>
                      <Text style={styles.evaluationKey}>{key}</Text>
                      <Text style={styles.evaluationValue}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  }, [handleAttendance, loading, motherId, schedules, updatingId]);

  return (
    <View style={globalStyles.screen}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Jadwal Pemeriksaan</Text>
        <Text style={styles.subtitle}>
          Pantau jadwal konsultasi dan konfirmasi kehadiran agar bidan dapat menyiapkan sesi terbaik untuk Anda.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {content}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 24,
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    backgroundColor: colors.dangerPastel,
    borderRadius: spacing.md,
    padding: spacing.md,
  },
  listContainer: {
    gap: spacing.lg,
  },
  scheduleCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  cardHeader: {
    gap: spacing.xs,
  },
  scheduleTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  scheduleTime: {
    ...typography.body,
    color: colors.textMuted,
  },
  scheduleDescription: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaLabel: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: spacing.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  presentButton: {
    backgroundColor: '#10B981',
  },
  absentButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonLabel: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '700',
  },
  evaluationCard: {
    borderWidth: 1,
    borderColor: colors.outlineMuted,
    backgroundColor: colors.lavenderPastel,
    borderRadius: spacing.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  evaluationTitle: {
    ...typography.subtitle,
    color: colors.pastelTitle,
  },
  evaluationRow: {
    gap: spacing.xs,
  },
  evaluationKey: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  evaluationValue: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
  },
  emptyState: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

export default ScheduleScreen;
