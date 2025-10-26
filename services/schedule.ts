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

type ScheduleResponse =
  | Schedule[]
  | {
      data?: Schedule[] | null;
    };

const normalizeSchedules = (input: ScheduleResponse): Schedule[] => {
  if (Array.isArray(input)) {
    return input;
  }

  if (input && Array.isArray(input.data)) {
    return input.data;
  }

  return [];
};

export const getSchedules = async (
  motherId: string | number
): Promise<Schedule[]> => {
  const { data } = await api.get<ScheduleResponse>("/api/schedules", {
    params: { mother_id: motherId },
  });

  return normalizeSchedules(data);
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
