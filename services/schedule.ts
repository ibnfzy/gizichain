import api from "./api";

export type AttendanceStatus = "confirmed" | "declined";

export type AttendancePayload = AttendanceStatus;

export interface Schedule {
  id: string | number;
  title?: string;
  description?: string;
  scheduledAt?: string;
  attendance?: AttendanceStatus | null;
  [key: string]: unknown;
}

export const getSchedules = async (
  motherId: string | number
): Promise<Schedule[]> => {
  const { data } = await api.get<Schedule[]>("/api/schedules", {
    params: { mother_id: motherId },
  });

  return data;
};

export const setAttendance = async (
  scheduleId: string | number,
  attendance: AttendancePayload
): Promise<Schedule> => {
  const { data } = await api.put<Schedule>(
    `/api/schedules/${scheduleId}/attendance`,
    { attendance }
  );

  return data;
};
