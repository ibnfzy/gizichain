import api from "./api";

export interface Notification {
  id: string | number;
  title: string;
  message: string;
  created_at: string;
  read_at?: string | null;
  [key: string]: unknown;
}

export const getUnread = async (
  motherId: string | number
): Promise<Notification[]> => {
  const { data } = await api.get<Notification[]>("/api/notifications/unread", {
    params: { mother_id: motherId },
  });

  return data;
};

export const markRead = async (
  notificationId: string | number
): Promise<Notification> => {
  const { data } = await api.post<Notification>(
    `/api/notifications/${notificationId}/read`
  );

  return data;
};
