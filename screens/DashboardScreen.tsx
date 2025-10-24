import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton, InfoCard } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { InferenceData, fetchLatestInference } from '@/services/api';
import colors from '@/styles/colors';

const STATUS_VARIANTS = {
  healthy: {
    container: 'border border-brand-green bg-brand-green/10',
    badge: 'self-start rounded-full bg-brand-green/20 px-3 py-1 text-sm font-semibold text-brand-green',
    text: 'text-brand-green',
  },
  warning: {
    container: 'border border-amber-400 bg-amber-100/60',
    badge: 'self-start rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-700',
    text: 'text-amber-700',
  },
  critical: {
    container: 'border border-rose-500 bg-rose-100/70',
    badge: 'self-start rounded-full bg-rose-200 px-3 py-1 text-sm font-semibold text-rose-600',
    text: 'text-rose-600',
  },
  unknown: {
    container: 'border border-gray-300 bg-gray-100/70',
    badge: 'self-start rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600',
    text: 'text-gray-600',
  },
} as const;

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

  const statusVariant = useMemo(() => STATUS_VARIANTS[normalizeStatus(inference?.status)], [
    inference?.status,
  ]);

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
      className="flex-1 bg-brand-white"
      contentContainerClassName="px-8 pb-16 pt-12"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View className="mb-8">
        <Text className="text-xl text-gray-500">Halo,</Text>
        <Text className="mt-1 text-3xl font-bold text-brand-green">{user?.name ?? 'Ibu Hebat'}</Text>
        <Text className="mt-2 text-base text-gray-600">
          Berikut adalah status gizi dan kebutuhan harian Anda hari ini.
        </Text>
      </View>

      <View className={`mb-6 rounded-3xl p-6 ${statusVariant.container}`}>
        <Text className={statusVariant.badge}>{(inference?.status ?? 'Belum ada data').toUpperCase()}</Text>
        {inference?.recommendation ? (
          <Text className={`mt-4 text-base ${statusVariant.text}`}>{inference.recommendation}</Text>
        ) : (
          <Text className={`mt-4 text-base ${statusVariant.text}`}>
            {loading
              ? 'Memuat status gizi...'
              : 'Status gizi terbaru akan muncul di sini setelah pemeriksaan.'}
          </Text>
        )}
        {inference?.updatedAt ? (
          <Text className="mt-3 text-xs text-gray-500">Pembaruan terakhir: {inference.updatedAt}</Text>
        ) : null}
      </View>

      <InfoCard title="Kebutuhan Harian" contentContainerStyle={styles.dailyNeedsContent}>
        <View className="flex-row items-center justify-between rounded-2xl bg-brand-green/5 px-4 py-3">
          <Text className="text-base text-gray-600">Energi</Text>
          <Text className="text-lg font-semibold text-brand-green">{inference?.energy ?? 0} kkal</Text>
        </View>
        <View className="flex-row items-center justify-between rounded-2xl bg-brand-pink/5 px-4 py-3">
          <Text className="text-base text-gray-600">Protein</Text>
          <Text className="text-lg font-semibold text-brand-pink">{inference?.protein ?? 0} g</Text>
        </View>
        <View className="flex-row items-center justify-between rounded-2xl bg-brand-green/5 px-4 py-3">
          <Text className="text-base text-gray-600">Cairan</Text>
          <Text className="text-lg font-semibold text-brand-green">{inference?.fluid ?? 0} ml</Text>
        </View>
      </InfoCard>

      {error ? <Text className="mt-6 text-sm text-rose-500">{error}</Text> : null}

      <View className="mt-10">
        <AppButton label="Keluar" onPress={logout} style={styles.logoutButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dailyNeedsContent: {
    gap: 12,
  },
  logoutButton: {
    backgroundColor: colors.error,
  },
});
