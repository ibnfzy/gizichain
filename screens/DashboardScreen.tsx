import { AppButton, InfoCard } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { InferenceData, fetchLatestInference } from "@/services/api";
import { colors, globalStyles, spacing, typography } from "@/styles";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import {
  Animated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const STATUS_VARIANTS = StyleSheet.create({
  healthyContainer: {
    borderColor: colors.primaryPastel,
    backgroundColor: colors.mintPastel,
  } as ViewStyle,
  healthyBadge: {
    backgroundColor: colors.primaryPastel,
    color: colors.primary,
  } as TextStyle,
  healthyText: {
    color: colors.primary,
  } as TextStyle,
  warningContainer: {
    borderColor: colors.secondaryPastel,
    backgroundColor: colors.accentTint,
  } as ViewStyle,
  warningBadge: {
    backgroundColor: colors.secondaryPastel,
    color: colors.secondary,
  } as TextStyle,
  warningText: {
    color: colors.secondary,
  } as TextStyle,
  criticalContainer: {
    borderColor: colors.dangerPastel,
    backgroundColor: colors.dangerPastel,
  } as ViewStyle,
  criticalBadge: {
    backgroundColor: colors.dangerTint,
    color: colors.danger,
  } as TextStyle,
  criticalText: {
    color: colors.danger,
  } as TextStyle,
  unknownContainer: {
    borderColor: colors.lavenderPastel,
    backgroundColor: colors.lavenderPastel,
  } as ViewStyle,
  unknownBadge: {
    backgroundColor: colors.primaryPastel,
    color: colors.textMuted,
  } as TextStyle,
  unknownText: {
    color: colors.textMuted,
  } as TextStyle,
});

const normalizeStatus = (status?: string) => {
  const normalized = status?.toLowerCase() ?? "unknown";

  if (["sehat", "baik", "normal", "green"].includes(normalized)) {
    return "healthy" as const;
  }

  if (["kuning", "waspada", "warning"].includes(normalized)) {
    return "warning" as const;
  }

  if (["merah", "buruk", "danger", "critical"].includes(normalized)) {
    return "critical" as const;
  }

  return "unknown" as const;
};

export function DashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { scheduleReminders, markAsRead } = useNotifications();
  const [inference, setInference] = useState<InferenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noInferenceAvailable, setNoInferenceAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const inferenceAnimation = useRef(new Animated.Value(0)).current;

  const motherId = user?.id;
  const latestScheduleReminder = scheduleReminders[0];
  const additionalScheduleReminderCount = Math.max(
    scheduleReminders.length - 1,
    0
  );

  const statusVariant = useMemo<{
    container: ViewStyle;
    badge: StyleProp<TextStyle>;
    text: StyleProp<TextStyle>;
  }>(() => {
    const status = normalizeStatus(inference?.status);

    if (status === "healthy") {
      return {
        container: STATUS_VARIANTS.healthyContainer,
        badge: StyleSheet.compose(
          styles.statusBadge,
          STATUS_VARIANTS.healthyBadge
        ),
        text: StyleSheet.compose(
          styles.statusText,
          STATUS_VARIANTS.healthyText
        ),
      };
    }

    if (status === "warning") {
      return {
        container: STATUS_VARIANTS.warningContainer,
        badge: StyleSheet.compose(
          styles.statusBadge,
          STATUS_VARIANTS.warningBadge
        ),
        text: StyleSheet.compose(
          styles.statusText,
          STATUS_VARIANTS.warningText
        ),
      };
    }

    if (status === "critical") {
      return {
        container: STATUS_VARIANTS.criticalContainer,
        badge: StyleSheet.compose(
          styles.statusBadge,
          STATUS_VARIANTS.criticalBadge
        ),
        text: StyleSheet.compose(
          styles.statusText,
          STATUS_VARIANTS.criticalText
        ),
      };
    }

    return {
      container: STATUS_VARIANTS.unknownContainer,
      badge: StyleSheet.compose(
        styles.statusBadge,
        STATUS_VARIANTS.unknownBadge
      ),
      text: StyleSheet.compose(styles.statusText, STATUS_VARIANTS.unknownText),
    };
  }, [inference?.status]);

  const fetchData = useCallback(async () => {
    if (!motherId) {
      setInference(null);
      setNoInferenceAvailable(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNoInferenceAvailable(false);
    try {
      const data = await fetchLatestInference(motherId);
      if (!data) {
        setInference(null);
        setNoInferenceAvailable(true);
      } else {
        setInference(data);
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch inference data", err);
      setError("Tidak dapat memuat data inferensi. Coba lagi nanti.");
      setNoInferenceAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [motherId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  const handleRefresh = useCallback(async () => {
    if (!motherId) return;
    setRefreshing(true);
    try {
      const data = await fetchLatestInference(motherId);
      if (!data) {
        setInference(null);
        setNoInferenceAvailable(true);
      } else {
        setInference(data);
        setNoInferenceAvailable(false);
      }
      setError(null);
    } catch (err: unknown) {
      console.warn("Failed to refresh inference data", err);
      setError("Tidak dapat memuat data inferensi. Coba lagi nanti.");
      setNoInferenceAvailable(false);
    } finally {
      setRefreshing(false);
    }
  }, [motherId]);

  const statusCardStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      globalStyles.cardPastel as ViewStyle,
      styles.statusCard,
      statusVariant.container,
    ],
    [statusVariant.container]
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
    [inferenceAnimation]
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

  const handleOpenSchedule = useCallback(() => {
    router.push("/(tabs)/schedule");

    if (scheduleReminders.length > 0) {
      Promise.all(
        scheduleReminders.map((reminder) => markAsRead(reminder.id))
      ).catch((err) =>
        console.warn("Failed to mark schedule reminders as read", err)
      );
    }
  }, [markAsRead, router, scheduleReminders]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <LinearGradient
        colors={[colors.secondaryPastel, colors.accentTint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.greeting}>Halo,</Text>
        <Text style={styles.userName}>{user?.name ?? "Ibu Hebat"}</Text>
        <Text style={styles.description}>
          Berikut adalah status gizi dan kebutuhan harian Anda hari ini.
        </Text>
      </LinearGradient>

      {latestScheduleReminder ? (
        <Animated.View style={[styles.reminderBanner, animatedEntranceStyle]}>
          <View style={styles.reminderTextContainer}>
            <Text style={styles.reminderTitle}>
              {String(latestScheduleReminder.title ?? "Pengingat Jadwal")}
            </Text>
            {latestScheduleReminder.message ? (
              <Text style={styles.reminderMessage}>
                {String(latestScheduleReminder.message)}
              </Text>
            ) : null}
            {additionalScheduleReminderCount > 0 ? (
              <Text style={styles.reminderMeta}>
                +{additionalScheduleReminderCount} pengingat jadwal lainnya
                belum dibaca
              </Text>
            ) : null}
          </View>
          <AppButton
            label="Lihat Jadwal"
            onPress={handleOpenSchedule}
            style={styles.reminderButton}
          />
        </Animated.View>
      ) : null}

      <Animated.View style={[statusCardStyle, animatedEntranceStyle]}>
        <Text style={statusVariant.badge}>
          {(inference?.status ?? "Belum ada data").toUpperCase()}
        </Text>
        {noInferenceAvailable ? (
          <Text style={statusVariant.text}>
            Belum ada hasil inferensi untuk ibu ini.
          </Text>
        ) : inference?.recommendation ? (
          <Text style={statusVariant.text}>{inference.recommendation}</Text>
        ) : (
          <Text style={statusVariant.text}>
            {loading
              ? "Memuat status gizi..."
              : "Status gizi terbaru akan muncul di sini setelah pemeriksaan."}
          </Text>
        )}
        {inference?.updatedAt ? (
          <Text style={styles.statusUpdatedAt}>
            Pembaruan terakhir: {inference.updatedAt}
          </Text>
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
                <Text style={styles.nutrientValue}>
                  {inference?.energy ?? 0}
                </Text>
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
                <Text style={styles.nutrientValue}>
                  {inference?.protein ?? 0}
                </Text>
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
                <Text style={styles.nutrientValue}>
                  {inference?.fluid ?? 0}
                </Text>
                <Text style={styles.nutrientUnit}>ml</Text>
              </View>
            </View>
          </InfoCard>
        </View>
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.signOutContainer}>
        <AppButton
          label="Keluar"
          onPress={logout}
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  contentContainer: {
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxxxl,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  greeting: {
    ...typography.subtitle,
    color: colors.textMuted,
  } as TextStyle,
  userName: {
    marginTop: spacing.xs,
    ...typography.heading1,
    color: colors.primary,
  } as TextStyle,
  description: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textMuted,
  } as TextStyle,
  headerGradient: {
    borderRadius: 28,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  } as ViewStyle,
  reminderBanner: {
    backgroundColor: colors.primaryPastel,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    flexDirection: "column",
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  } as ViewStyle,
  reminderTextContainer: {
    gap: spacing.xs,
  } as ViewStyle,
  reminderTitle: {
    ...typography.subtitle,
    color: colors.primary,
  } as TextStyle,
  reminderMessage: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  } as TextStyle,
  reminderMeta: {
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
  reminderButton: {
    width: undefined,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  } as ViewStyle,
  statusCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowOpacity: 0,
    elevation: 0,
  } as ViewStyle,
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...typography.overline,
    fontSize: 13,
  } as TextStyle,
  statusText: {
    marginTop: spacing.md,
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  } as TextStyle,
  statusUpdatedAt: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
  dailyNeedsSection: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  } as ViewStyle,
  dailyNeedsHeading: {
    ...typography.heading2,
    color: colors.textPrimary,
  } as TextStyle,
  dailyNeedsList: {
    gap: spacing.lg,
  } as ViewStyle,
  nutrientCard: {
    borderRadius: 24,
  } as ViewStyle,
  nutrientContent: {
    paddingTop: 0,
  } as ViewStyle,
  nutrientDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  } as ViewStyle,
  nutrientValue: {
    ...typography.heading2,
    fontSize: 22,
    color: colors.textPrimary,
  } as TextStyle,
  nutrientUnit: {
    ...typography.caption,
    color: colors.textMuted,
  } as TextStyle,
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  energyIcon: {
    backgroundColor: colors.primaryPastel,
  } as ViewStyle,
  proteinIcon: {
    backgroundColor: colors.secondaryPastel,
  } as ViewStyle,
  fluidIcon: {
    backgroundColor: colors.skyPastel,
  } as ViewStyle,
  errorText: {
    marginTop: spacing.xl,
    ...typography.caption,
    color: colors.danger,
  } as TextStyle,
  signOutContainer: {
    marginTop: spacing.xxxl,
  } as ViewStyle,
  logoutButton: {
    backgroundColor: colors.danger,
  } as ViewStyle,
});
