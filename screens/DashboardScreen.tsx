import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { AppButton, InfoCard } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { InferenceData, fetchLatestInference } from '@/services/api';
import { colors, globalStyles, spacing, typography } from '@/styles';

const STATUS_VARIANTS = StyleSheet.create({
  healthyContainer: {
    borderColor: colors.primaryPastel,
    backgroundColor: colors.mintPastel,
  },
  healthyBadge: {
    backgroundColor: colors.primaryPastel,
    color: colors.primary,
  },
  healthyText: {
    color: colors.primary,
  },
  warningContainer: {
    borderColor: colors.secondaryPastel,
    backgroundColor: colors.accentTint,
  },
  warningBadge: {
    backgroundColor: colors.secondaryPastel,
    color: colors.secondary,
  },
  warningText: {
    color: colors.secondary,
  },
  criticalContainer: {
    borderColor: colors.dangerPastel,
    backgroundColor: colors.dangerPastel,
  },
  criticalBadge: {
    backgroundColor: colors.dangerTint,
    color: colors.danger,
  },
  criticalText: {
    color: colors.danger,
  },
  unknownContainer: {
    borderColor: colors.lavenderPastel,
    backgroundColor: colors.lavenderPastel,
  },
  unknownBadge: {
    backgroundColor: colors.primaryPastel,
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
  const inferenceAnimation = useRef(new Animated.Value(0)).current;

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

  const statusCardStyle = useMemo<StyleProp<ViewStyle>>(
    () => [globalStyles.cardPastel as ViewStyle, styles.statusCard, statusVariant.container],
    [statusVariant.container],
  );

  const animatedEntranceStyle = useMemo(
    () => ({
      opacity: inferenceAnimation,
      transform: [
        {
          translateY: inferenceAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 0],
          }),
        },
      ],
    }),
    [inferenceAnimation],
  );

  useEffect(() => {
    if (loading) {
      inferenceAnimation.setValue(0);
      return;
    }

    Animated.timing(inferenceAnimation, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [inference?.updatedAt, loading, inferenceAnimation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <LinearGradient
        colors={[colors.secondaryPastel, colors.accentTint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.greeting}>Halo,</Text>
        <Text style={styles.userName}>{user?.name ?? 'Ibu Hebat'}</Text>
        <Text style={styles.description}>
          Berikut adalah status gizi dan kebutuhan harian Anda hari ini.
        </Text>
      </LinearGradient>

      <Animated.View style={[statusCardStyle, animatedEntranceStyle]}>
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
      </Animated.View>

      <Animated.View style={[styles.dailyNeedsSection, animatedEntranceStyle]}>
        <Text style={styles.dailyNeedsHeading}>Kebutuhan Harian</Text>
        <View style={styles.dailyNeedsList}>
          <InfoCard
            title="Energi"
            variant="nutrient"
            style={styles.nutrientCard}
            contentContainerStyle={styles.nutrientContent}
          >
            <View style={styles.nutrientDetails}>
              <View style={[styles.iconBubble, styles.energyIcon]}>
                <Feather name="zap" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.nutrientValue}>{inference?.energy ?? 0}</Text>
                <Text style={styles.nutrientUnit}>kkal</Text>
              </View>
            </View>
          </InfoCard>

          <InfoCard
            title="Protein"
            variant="nutrient"
            style={styles.nutrientCard}
            contentContainerStyle={styles.nutrientContent}
          >
            <View style={styles.nutrientDetails}>
              <View style={[styles.iconBubble, styles.proteinIcon]}>
                <Feather name="feather" size={20} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.nutrientValue}>{inference?.protein ?? 0}</Text>
                <Text style={styles.nutrientUnit}>gram</Text>
              </View>
            </View>
          </InfoCard>

          <InfoCard
            title="Cairan"
            variant="nutrient"
            style={styles.nutrientCard}
            contentContainerStyle={styles.nutrientContent}
          >
            <View style={styles.nutrientDetails}>
              <View style={[styles.iconBubble, styles.fluidIcon]}>
                <Feather name="droplet" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.nutrientValue}>{inference?.fluid ?? 0}</Text>
                <Text style={styles.nutrientUnit}>ml</Text>
              </View>
            </View>
          </InfoCard>
        </View>
      </Animated.View>

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
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxxxl,
    paddingHorizontal: spacing.lg,
  },
  greeting: {
    ...typography.subtitle,
    color: colors.textMuted,
  },
  userName: {
    marginTop: spacing.xs,
    ...typography.heading1,
    color: colors.primary,
  },
  description: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textMuted,
  },
  headerGradient: {
    borderRadius: 28,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
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
    ...typography.overline,
    fontSize: 13,
  },
  statusText: {
    marginTop: spacing.md,
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusUpdatedAt: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  },
  dailyNeedsSection: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  dailyNeedsHeading: {
    ...typography.heading2,
    color: colors.textPrimary,
  },
  dailyNeedsList: {
    gap: spacing.lg,
  },
  nutrientCard: {
    borderRadius: 24,
  },
  nutrientContent: {
    paddingTop: 0,
  },
  nutrientDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  nutrientValue: {
    ...typography.heading2,
    fontSize: 22,
    color: colors.textPrimary,
  },
  nutrientUnit: {
    ...typography.caption,
    color: colors.textMuted,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyIcon: {
    backgroundColor: colors.primaryPastel,
  },
  proteinIcon: {
    backgroundColor: colors.secondaryPastel,
  },
  fluidIcon: {
    backgroundColor: colors.skyPastel,
  },
  errorText: {
    marginTop: spacing.xl,
    ...typography.caption,
    color: colors.danger,
  },
  signOutContainer: {
    marginTop: spacing.xxxl,
  },
  logoutButton: {
    backgroundColor: colors.danger,
  },
});
