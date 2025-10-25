import api from "./api";

export type AttendanceStatus = "present" | "absent" | "excused" | "pending";

export interface Schedule {
  id: string | number;
  title?: string;
  description?: string;
  scheduledAt?: string;
  attendance?: AttendanceStatus | null;
  [key: string]: unknown;
}

export interface AttendancePayload {
  status: AttendanceStatus;
  notes?: string;
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
  const { data } = await api.post<Schedule>(
    `/api/schedules/${scheduleId}/attendance`,
    attendance
  );

  return data;
};
