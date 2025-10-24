import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, InfoCard } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { InferenceData, fetchLatestInference } from '@/services/api';
import { colors, globalStyles, spacing } from '@/styles';

const STATUS_VARIANTS = StyleSheet.create({
  healthyContainer: {
    borderColor: colors.statusHealthyBorder,
    backgroundColor: colors.statusHealthyBackground,
  },
  healthyBadge: {
    backgroundColor: colors.statusHealthyBadge,
    color: colors.statusHealthyBorder,
  },
  healthyText: {
    color: colors.statusHealthyBorder,
  },
  warningContainer: {
    borderColor: colors.statusWarningBorder,
    backgroundColor: colors.statusWarningBackground,
  },
  warningBadge: {
    backgroundColor: colors.statusWarningBadge,
    color: colors.statusWarningBorder,
  },
  warningText: {
    color: colors.statusWarningBorder,
  },
  criticalContainer: {
    borderColor: colors.statusCriticalBorder,
    backgroundColor: colors.statusCriticalBackground,
  },
  criticalBadge: {
    backgroundColor: colors.statusCriticalBadge,
    color: colors.statusCriticalBorder,
  },
  criticalText: {
    color: colors.statusCriticalBorder,
  },
  unknownContainer: {
    borderColor: colors.statusUnknownBorder,
    backgroundColor: colors.statusUnknownBackground,
  },
  unknownBadge: {
    backgroundColor: colors.statusUnknownBadge,
    color: colors.textMuted,
  },
  unknownText: {
    color: colors.textMuted,
  },
});

const normalizeStatus = (status?: string) => {
  const normalized = status?.toLowerCase() ?? 'unknown';

  if (['sehat', 'baik', 'normal', 'green'].includes(normalized)) {
    return 'healthy' as const;
  }

  if (['kuning', 'waspada', 'warning'].includes(normalized)) {
    return 'warning' as const;
  }

  if (['merah', 'buruk', 'danger', 'critical'].includes(normalized)) {
    return 'critical' as const;
  }

  return 'unknown' as const;
};

export function DashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [inference, setInference] = useState<InferenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const motherId = user?.id;

  const statusVariant = useMemo<{
    container: ViewStyle;
    badge: StyleProp<TextStyle>;
    text: StyleProp<TextStyle>;
  }>(() => {
    const status = normalizeStatus(inference?.status);

    if (status === 'healthy') {
      return {
        container: STATUS_VARIANTS.healthyContainer,
        badge: StyleSheet.compose(styles.statusBadge, STATUS_VARIANTS.healthyBadge),
        text: StyleSheet.compose(styles.statusText, STATUS_VARIANTS.healthyText),
      };
    }

    if (status === 'warning') {
      return {
        container: STATUS_VARIANTS.warningContainer,
        badge: StyleSheet.compose(styles.statusBadge, STATUS_VARIANTS.warningBadge),
        text: StyleSheet.compose(styles.statusText, STATUS_VARIANTS.warningText),
      };
    }

    if (status === 'critical') {
      return {
        container: STATUS_VARIANTS.criticalContainer,
        badge: StyleSheet.compose(styles.statusBadge, STATUS_VARIANTS.criticalBadge),
        text: StyleSheet.compose(styles.statusText, STATUS_VARIANTS.criticalText),
      };
    }

    return {
      container: STATUS_VARIANTS.unknownContainer,
      badge: StyleSheet.compose(styles.statusBadge, STATUS_VARIANTS.unknownBadge),
      text: StyleSheet.compose(styles.statusText, STATUS_VARIANTS.unknownText),
    };
  }, [inference?.status]);

  const fetchData = useCallback(async () => {
    if (!motherId) {
      setInference(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestInference(motherId);
      setInference(data);
    } catch (err: unknown) {
      console.warn('Failed to fetch inference data', err);
      setError('Tidak dapat memuat data inferensi. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [motherId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, router, user]);

  const handleRefresh = useCallback(async () => {
    if (!motherId) return;
    setRefreshing(true);
    try {
      const data = await fetchLatestInference(motherId);
      setInference(data);
      setError(null);
    } catch (err: unknown) {
      console.warn('Failed to refresh inference data', err);
      setError('Tidak dapat memuat data inferensi. Coba lagi nanti.');
    } finally {
      setRefreshing(false);
    }
  }, [motherId]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo,</Text>
        <Text style={styles.userName}>{user?.name ?? 'Ibu Hebat'}</Text>
        <Text style={styles.description}>
          Berikut adalah status gizi dan kebutuhan harian Anda hari ini.
        </Text>
      </View>

      <View style={[globalStyles.card, styles.statusCard, statusVariant.container]}>
        <Text style={statusVariant.badge}>{(inference?.status ?? 'Belum ada data').toUpperCase()}</Text>
        {inference?.recommendation ? (
          <Text style={statusVariant.text}>{inference.recommendation}</Text>
        ) : (
          <Text style={statusVariant.text}>
            {loading
              ? 'Memuat status gizi...'
              : 'Status gizi terbaru akan muncul di sini setelah pemeriksaan.'}
          </Text>
        )}
        {inference?.updatedAt ? (
          <Text style={styles.statusUpdatedAt}>Pembaruan terakhir: {inference.updatedAt}</Text>
        ) : null}
      </View>

      <InfoCard
        title="Kebutuhan Harian"
        style={styles.dailyNeedsCard}
        contentContainerStyle={styles.dailyNeedsContent}
      >
        <View style={[styles.dailyNeedsRow, styles.energyRow]}>
          <Text style={styles.dailyNeedsLabel}>Energi</Text>
          <Text style={styles.energyValue}>{inference?.energy ?? 0} kkal</Text>
        </View>
        <View style={[styles.dailyNeedsRow, styles.proteinRow]}>
          <Text style={styles.dailyNeedsLabel}>Protein</Text>
          <Text style={styles.proteinValue}>{inference?.protein ?? 0} g</Text>
        </View>
        <View style={[styles.dailyNeedsRow, styles.fluidRow]}>
          <Text style={styles.dailyNeedsLabel}>Cairan</Text>
          <Text style={styles.energyValue}>{inference?.fluid ?? 0} ml</Text>
        </View>
      </InfoCard>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.signOutContainer}>
        <AppButton label="Keluar" onPress={logout} style={styles.logoutButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brandBackground,
  },
  contentContainer: {
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxxxl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.textMuted,
  },
  userName: {
    marginTop: spacing.xs,
    fontSize: 30,
    fontWeight: '700',
    color: colors.brandGreen,
  },
  description: {
    marginTop: spacing.sm,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowOpacity: 0,
    elevation: 0,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 24,
  },
  statusUpdatedAt: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.muted,
  },
  dailyNeedsCard: {
    marginBottom: spacing.xl,
  },
  dailyNeedsContent: {
    gap: spacing.md,
  },
  dailyNeedsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dailyNeedsLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  energyRow: {
    backgroundColor: colors.brandGreenBackground,
  },
  proteinRow: {
    backgroundColor: colors.brandPinkBackground,
  },
  fluidRow: {
    backgroundColor: colors.brandGreenBackground,
  },
  energyValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.brandGreen,
  },
  proteinValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.brandPink,
  },
  errorText: {
    marginTop: spacing.xl,
    fontSize: 14,
    color: colors.error,
  },
  signOutContainer: {
    marginTop: spacing.xxxl,
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
});
