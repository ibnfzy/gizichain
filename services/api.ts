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

export interface InferenceStatusMeta {
  code?: string;
  label?: string;
  badge?: string;
  tone?: string;
  source?: string;
}

export interface InferenceData {
  status: string;
  statusMeta?: InferenceStatusMeta;
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

interface InferenceOutput {
  requirements?: InferenceRequirements;
  daily_requirements?: InferenceRequirements;
}

interface InferenceStatusPayload {
  code?: string;
  label?: string;
  badge?: string;
  tone?: string;
  source?: string;
  [key: string]: unknown;
}

interface InferencePayload {
  status?: string | InferenceStatusPayload | null;
  recommendation?: string;
  notes?: string;
  requirements?: InferenceRequirements;
  daily_requirements?: InferenceRequirements;
  output?: InferenceOutput;
  energy?: number | string;
  protein?: number | string;
  fluid?: number | string;
  updated_at?: string;
  updatedAt?: string;
  created_at_human?: string;
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

interface LatestInferenceResponse {
  mother?: unknown;
  inference?: InferencePayload | null;
}

const parseNumber = (
  value: number | string | undefined | null
): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getRequirementValue = (
  key: keyof InferenceRequirements,
  output: InferenceOutput | undefined,
  legacy: InferenceRequirements | undefined,
  legacyDaily: InferenceRequirements | undefined,
  fallback: number | string | undefined
): number => {
  const requirements = output?.requirements ?? {};
  const dailyRequirements = output?.daily_requirements ?? {};

  const sources = [
    parseNumber(requirements[key]),
    parseNumber(dailyRequirements[key]),
    parseNumber(legacy?.[key]),
    parseNumber(legacyDaily?.[key]),
    parseNumber(fallback),
  ];

  for (const value of sources) {
    if (value !== undefined) {
      return value;
    }
  }

  return 0;
};

const parseInferenceStatus = (
  status: InferencePayload["status"]
): { value: string; meta?: InferenceStatusMeta } => {
  if (!status) {
    return { value: "unknown" };
  }

  if (typeof status === "string") {
    return { value: status };
  }

  if (typeof status === "object") {
    const meta: InferenceStatusMeta = {};

    if (typeof status.code === "string" && status.code.trim().length > 0) {
      meta.code = status.code;
    }

    if (typeof status.label === "string" && status.label.trim().length > 0) {
      meta.label = status.label;
    }

    if (typeof status.badge === "string" && status.badge.trim().length > 0) {
      meta.badge = status.badge;
    }

    if (typeof status.tone === "string" && status.tone.trim().length > 0) {
      meta.tone = status.tone;
    }

    if (typeof status.source === "string" && status.source.trim().length > 0) {
      meta.source = status.source;
    }

    const value = meta.code ?? meta.label ?? "unknown";

    return {
      value,
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    };
  }

  return { value: "unknown" };
};

export const fetchLatestInference = async (
  motherId: string | number
): Promise<InferenceData | null> => {
  const response = await api.get<
    ApiResponse<LatestInferenceResponse | LatestInferenceResponse[] | null>
  >("/api/inference/latest", {
    params: { mother_id: motherId },
  });

  const { status: isSuccessful, message, data: payloadData } = response.data;

  const latestPayload = Array.isArray(payloadData)
    ? payloadData[0] ?? null
    : payloadData;

  if (!isSuccessful) {
    throw new Error(message || "Failed to fetch latest inference");
  }

  const inference = latestPayload?.inference ?? null;

  if (!inference) {
    return null;
  }

  const requirements: InferenceRequirements = inference.requirements ?? {};
  const dailyRequirements: InferenceRequirements =
    inference.daily_requirements ?? {};

  const output = inference.output ?? {};

  const { value: statusValue, meta: statusMeta } = parseInferenceStatus(
    inference.status
  );

  return {
    status: statusValue,
    statusMeta,
    recommendation: inference.recommendation ?? inference.notes,
    energy: getRequirementValue(
      "energy",
      output,
      requirements,
      dailyRequirements,
      inference.energy
    ),
    protein: getRequirementValue(
      "protein",
      output,
      requirements,
      dailyRequirements,
      inference.protein
    ),
    fluid: getRequirementValue(
      "fluid",
      output,
      requirements,
      dailyRequirements,
      inference.fluid
    ),
    updatedAt:
      inference.created_at_human ??
      inference.updated_at ??
      inference.updatedAt,
  };
};

export default api;
