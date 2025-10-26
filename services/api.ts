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
  const { data } = await api.get("/api/inference/latest", {
    params: { mother_id: motherId },
  });

  return {
    status: data?.status ?? "unknown",
    recommendation: data?.recommendation ?? data?.notes,
    energy:
      Number(
        data?.requirements?.energy ??
          data?.daily_requirements?.energy ??
          data?.energy ??
          0
      ) || 0,
    protein:
      Number(
        data?.requirements?.protein ??
          data?.daily_requirements?.protein ??
          data?.protein ??
          0
      ) || 0,
    fluid:
      Number(
        data?.requirements?.fluid ??
          data?.daily_requirements?.fluid ??
          data?.fluid ??
          0
      ) || 0,
    updatedAt: data?.updated_at ?? data?.updatedAt,
  } as InferenceData;
};

export default api;
