import axios from "axios";

export interface ApiUser {
  id: string | number;
  name: string;
  email: string;
}

export interface AuthPayload {
  token: string;
  user: ApiUser;
}

export interface AuthResponse {
  status: boolean;
  message: string;
  data: AuthPayload;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface InferenceData {
  status: string;
  recommendation?: string;
  energy: number;
  protein: number;
  fluid: number;
  updatedAt?: string;
}

interface InferenceRequirements {
  energy?: number | string;
  protein?: number | string;
  fluid?: number | string;
}

interface InferencePayload {
  status?: string;
  recommendation?: string;
  notes?: string;
  requirements?: InferenceRequirements;
  daily_requirements?: InferenceRequirements;
  energy?: number | string;
  protein?: number | string;
  fluid?: number | string;
  updated_at?: string;
  updatedAt?: string;
}

const api = axios.create({
  baseURL: "https://olive.jultdev.site",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const loginRequest = async (
  payload: LoginPayload
): Promise<AuthPayload> => {
  const { data } = await api.post<AuthResponse>("/api/auth/login", payload);
  return data.data;
};

export const registerRequest = async (
  payload: RegisterPayload
): Promise<AuthPayload> => {
  const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
  return data.data;
};

export const fetchLatestInference = async (
  motherId: string | number
): Promise<InferenceData> => {
  const response = await api.get<
    ApiResponse<InferencePayload | InferencePayload[] | null>
  >("/api/inference/latest", {
    params: { mother_id: motherId },
  });

  const { status: isSuccessful, message, data: payloadData } = response.data;

  const latestPayload = Array.isArray(payloadData)
    ? payloadData[0] ?? null
    : payloadData;

  if (!isSuccessful || !latestPayload) {
    throw new Error(message || "Failed to fetch latest inference");
  }

  const requirements: InferenceRequirements = latestPayload.requirements ?? {};
  const dailyRequirements: InferenceRequirements =
    latestPayload.daily_requirements ?? {};

  return {
    status: latestPayload.status ?? "unknown",
    recommendation: latestPayload.recommendation ?? latestPayload.notes,
    energy:
      Number(
        requirements.energy ??
          dailyRequirements.energy ??
          latestPayload.energy ??
          0
      ) || 0,
    protein:
      Number(
        requirements.protein ??
          dailyRequirements.protein ??
          latestPayload.protein ??
          0
      ) || 0,
    fluid:
      Number(
        requirements.fluid ??
          dailyRequirements.fluid ??
          latestPayload.fluid ??
          0
      ) || 0,
    updatedAt: latestPayload.updated_at ?? latestPayload.updatedAt,
  } as InferenceData;
};

export default api;
