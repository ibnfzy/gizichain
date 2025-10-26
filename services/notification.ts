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
  const response = await api.get<{
    status: string;
    message: string;
    data: Notification[];
  }>("/api/notifications", {
    params: { mother_id: motherId, unread: 1 },
  });

  return response.data.data ?? [];
};

export const markRead = async (
  notificationId: string | number
): Promise<Notification> => {
  const { data } = await api.put<Notification>(
    `/api/notifications/${notificationId}/read`
  );

  return data;
};
