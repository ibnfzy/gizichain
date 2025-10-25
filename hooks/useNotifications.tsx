import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { useAuth } from './useAuth';
import { Notification, getUnread, markRead } from '@/services/notification';

type NotificationIdentifier = Notification | string | number;

type NotificationsContextValue = {
  notifications: Notification[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  countsByType: Record<string, number>;
  scheduleReminders: Notification[];
  markAsRead: (notification: NotificationIdentifier) => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const resolveNotificationId = (notification: NotificationIdentifier): string | number => {
  if (typeof notification === 'object') {
    return notification.id;
  }

  return notification;
};

const extractNotificationType = (notification: Notification): string => {
  const rawType =
    (notification as Record<string, unknown>).type ??
    (notification as Record<string, unknown>).notification_type ??
    (notification as Record<string, unknown>).category ??
    (notification as Record<string, unknown>).kind ??
    (typeof (notification as Record<string, unknown>).data === 'object' &&
    (notification as Record<string, unknown>).data !== null
      ? (notification as Record<string, unknown>).data &&
        (notification as { data?: { type?: string } }).data?.type
      : undefined);

  return typeof rawType === 'string' ? rawType.toLowerCase().replace(/_/g, '-') : 'general';
};

interface NotificationsProviderProps {
  children: ReactNode;
  pollInterval?: number;
}

export const NotificationsProvider = ({
  children,
  pollInterval = 12000,
}: NotificationsProviderProps) => {
  const { user } = useAuth();
  const motherId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);

  const clearPoller = useCallback(() => {
    if (pollerRef.current) {
      clearInterval(pollerRef.current);
      pollerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearPoller();
    };
  }, [clearPoller]);

  const fetchUnread = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!motherId) {
        if (isMountedRef.current) {
          setNotifications([]);
          setLoading(false);
          setRefreshing(false);
          setError(null);
          hasLoadedRef.current = false;
        }
        return;
      }

      const shouldShowLoading = !silent && !hasLoadedRef.current;
      const shouldShowRefreshing = !silent && hasLoadedRef.current;

      if (shouldShowLoading) {
        setLoading(true);
      }

      if (shouldShowRefreshing) {
        setRefreshing(true);
      }

      try {
        const data = await getUnread(motherId);
        if (!isMountedRef.current) {
          return;
        }

        setNotifications(data ?? []);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch unread notifications', err);
        if (!silent && isMountedRef.current) {
          setError('Tidak dapat memuat notifikasi baru. Coba lagi nanti.');
        }
      } finally {
        if (!isMountedRef.current) {
          return;
        }

        if (shouldShowLoading) {
          setLoading(false);
        }

        if (shouldShowRefreshing) {
          setRefreshing(false);
        }

        if (!hasLoadedRef.current) {
          hasLoadedRef.current = true;
        }
      }
    },
    [motherId],
  );

  useEffect(() => {
    if (!motherId) {
      clearPoller();
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      hasLoadedRef.current = false;
      return;
    }

    hasLoadedRef.current = false;
    fetchUnread();

    clearPoller();
    pollerRef.current = setInterval(() => {
      fetchUnread({ silent: true }).catch((err) =>
        console.warn('Failed to poll notifications', err),
      );
    }, pollInterval);

    return () => {
      clearPoller();
    };
  }, [clearPoller, fetchUnread, motherId, pollInterval]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && motherId) {
        fetchUnread({ silent: true }).catch((err) =>
          console.warn('Failed to refresh notifications on resume', err),
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchUnread, motherId]);

  const countsByType = useMemo(() => {
    return notifications.reduce<Record<string, number>>((acc, notification) => {
      const type = extractNotificationType(notification);
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});
  }, [notifications]);

  const scheduleReminders = useMemo(() => {
    return notifications.filter(
      (notification) => extractNotificationType(notification) === 'schedule-reminder',
    );
  }, [notifications]);

  const markAsRead = useCallback(
    async (notification: NotificationIdentifier) => {
      const notificationId = resolveNotificationId(notification);

      try {
        await markRead(notificationId);
        if (!isMountedRef.current) {
          return;
        }

        setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      } catch (err) {
        console.warn('Failed to mark notification as read', err);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    await fetchUnread({ silent: false });
  }, [fetchUnread]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      loading,
      refreshing,
      error,
      refresh,
      countsByType,
      scheduleReminders,
      markAsRead,
    }),
    [countsByType, error, loading, markAsRead, notifications, refresh, refreshing, scheduleReminders],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};
