import axios, { isAxiosError } from "axios";

export interface ApiUser {
  id: string | number;
  name: string;
  email: string;
  motherId?: string | number | null;
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

export type ApiFieldErrors = Record<string, string>;

export interface ApiErrorResponse<T = unknown> {
  status: boolean;
  message?: unknown;
  data?: T;
  [key: string]: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toMessage = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" && item.trim().length > 0) {
        return item;
      }
    }
  }

  return null;
};

const extractFieldErrors = (data: unknown): ApiFieldErrors | undefined => {
  if (!isRecord(data)) {
    return undefined;
  }

  const candidate = isRecord(data.errors) ? data.errors : data;

  if (!isRecord(candidate)) {
    return undefined;
  }

  const fieldErrors: ApiFieldErrors = {};

  for (const [field, message] of Object.entries(candidate)) {
    const resolvedMessage = toMessage(message);

    if (resolvedMessage) {
      fieldErrors[field] = resolvedMessage;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

const resolveErrorMessage = (message: unknown): string => {
  const resolved = toMessage(message);

  if (resolved) {
    return resolved;
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
};

export class ApiRequestError extends Error {
  status?: boolean;
  fieldErrors?: ApiFieldErrors;
  payload?: unknown;

  constructor(
    message: string,
    options: {
      status?: boolean;
      fieldErrors?: ApiFieldErrors;
      payload?: unknown;
    } = {}
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
    this.payload = options.payload;
  }
}

const createApiError = (response: ApiErrorResponse): ApiRequestError => {
  return new ApiRequestError(resolveErrorMessage(response.message), {
    status: response.status,
    fieldErrors: extractFieldErrors(response.data),
    payload: response.data,
  });
};

export const normalizeApiError = (error: unknown): ApiRequestError => {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (
    isRecord(error) &&
    "status" in error &&
    error.status === false &&
    ("message" in error || "data" in error)
  ) {
    return createApiError(error as ApiErrorResponse);
  }

  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (isRecord(responseData)) {
      return createApiError(responseData as ApiErrorResponse);
    }

    if (error.message) {
      return new ApiRequestError(error.message);
    }
  }

  if (error instanceof Error && error.message) {
    return new ApiRequestError(error.message);
  }

  return new ApiRequestError("Terjadi kesalahan. Silakan coba lagi.");
};

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterMotherPayload {
  bb: number;
  tb: number;
  umur: number;
  usia_bayi_bln: number;
  laktasi_tipe: string;
  aktivitas: string;
  alergi: string[];
  preferensi: string[];
  riwayat_penyakit: string[];
}

export interface RegisterPayload {
  user: RegisterUserPayload;
  ibu: RegisterMotherPayload;
}

export interface MotherProfile extends RegisterMotherPayload {
  id: string | number;
  name?: string;
  email?: string;
  riwayat?: string[];
}

export type MotherProfileUpdatePayload =
  Partial<RegisterMotherPayload> & {
    name?: string;
    email?: string;
    password?: string;
    riwayat?: string[];
  };

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
  if (!data.status) {
    const error: ApiErrorResponse = {
      status: data.status,
      message: data.message,
      data: data.data,
    };
    throw createApiError(error);
  }

  return data.data;
};

export const registerRequest = async (
  payload: RegisterPayload
): Promise<AuthPayload> => {
  const { data } = await api.post<AuthResponse>("/api/auth/register", payload);
  if (!data.status) {
    const error: ApiErrorResponse = {
      status: data.status,
      message: data.message,
      data: data.data,
    };
    throw createApiError(error);
  }

  return data.data;
};

const parseMotherNumberField = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();

    if (normalized.length > 0) {
      const parsed = Number(normalized);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
};

const parseMotherListField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item.trim() : String(item ?? "").trim()
      )
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
};

const parseMotherStringField = (value: unknown, fallback = ""): string => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return fallback;
};

const resolveMotherRecord = (
  payload: unknown
): Record<string, unknown> | undefined => {
  if (!isRecord(payload)) {
    return undefined;
  }

  if (isRecord(payload.mother)) {
    return payload.mother;
  }

  if (isRecord(payload.ibu)) {
    return payload.ibu;
  }

  return payload;
};

const parseMotherProfile = (
  payload: unknown,
  fallbackId: string | number
): MotherProfile => {
  const resolved = resolveMotherRecord(payload) ?? {};

  const idCandidate =
    (resolved.id as unknown) ??
    (resolved.mother_id as unknown) ??
    (resolved.motherId as unknown) ??
    fallbackId;

  const id =
    typeof idCandidate === "string" || typeof idCandidate === "number"
      ? idCandidate
      : fallbackId;

  const resolvedUser = isRecord(resolved.user) ? resolved.user : undefined;
  const resolvedProfile = isRecord(resolved.profile)
    ? resolved.profile
    : undefined;

  const alergi = parseMotherListField(
    resolved.alergi ?? resolvedProfile?.alergi ?? resolvedUser?.alergi
  );
  const preferensi = parseMotherListField(
    resolved.preferensi ??
      resolvedProfile?.preferensi ??
      resolvedUser?.preferensi
  );
  const riwayatList = parseMotherListField(
    resolved.riwayat ??
      resolved.riwayat_penyakit ??
      resolved.riwayatPenyakit ??
      resolvedProfile?.riwayat ??
      resolvedProfile?.riwayat_penyakit ??
      resolvedUser?.riwayat
  );

  return {
    id,
    name: parseMotherStringField(
      resolved.name ?? resolvedProfile?.name ?? resolvedUser?.name
    ),
    email: parseMotherStringField(
      resolved.email ?? resolvedProfile?.email ?? resolvedUser?.email
    ),
    bb: parseMotherNumberField(resolved.bb ?? resolvedProfile?.bb),
    tb: parseMotherNumberField(resolved.tb ?? resolvedProfile?.tb),
    umur: parseMotherNumberField(resolved.umur ?? resolvedProfile?.umur),
    usia_bayi_bln: parseMotherNumberField(
      resolved.usia_bayi_bln ??
        resolved.usia_bayi ??
        resolvedProfile?.usia_bayi_bln ??
        resolvedProfile?.usia_bayi
    ),
    laktasi_tipe: parseMotherStringField(
      resolved.laktasi_tipe ??
        resolved.laktasiTipe ??
        resolvedProfile?.laktasi_tipe ??
        resolvedProfile?.laktasiTipe,
      "eksklusif"
    ),
    aktivitas: parseMotherStringField(
      resolved.aktivitas ?? resolvedProfile?.aktivitas,
      "ringan"
    ),
    alergi,
    preferensi,
    riwayat: riwayatList,
    riwayat_penyakit: riwayatList,
  };
};

export const getMotherProfile = async (
  motherId: string | number
): Promise<MotherProfile> => {
  try {
    const { data } = await api.get<ApiResponse<unknown>>(
      `/api/mothers/${motherId}`
    );

    if (!data.status) {
      const error: ApiErrorResponse = {
        status: data.status,
        message: data.message,
        data: data.data,
      };
      throw createApiError(error);
    }

    return parseMotherProfile(data.data, motherId);
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const updateMotherProfile = async (
  motherId: string | number,
  payload: MotherProfileUpdatePayload
): Promise<MotherProfile> => {
  try {
    const { data } = await api.put<ApiResponse<unknown>>(
      `/api/mothers/${motherId}`,
      payload
    );

    if (!data.status) {
      const error: ApiErrorResponse = {
        status: data.status,
        message: data.message,
        data: data.data,
      };
      throw createApiError(error);
    }

    const responsePayload = data.data ?? payload;

    return parseMotherProfile(responsePayload, motherId);
  } catch (error) {
    throw normalizeApiError(error);
  }
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
      inference.created_at_human ?? inference.updated_at ?? inference.updatedAt,
  };
};

const parseIdentifier = (value: unknown): string | number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return null;
    }

    const numeric = Number(trimmed);

    return Number.isFinite(numeric) ? numeric : trimmed;
  }

  return null;
};

const parseOptionalString = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
};

const parseNullableString = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null;
  }

  return parseOptionalString(value);
};

export interface Consultation {
  id: string | number;
  motherId?: string | number | null;
  pakarId?: string | number | null;
  status?: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  mother?: unknown;
  pakar?: unknown;
}

const parseConsultation = (value: unknown): Consultation | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = parseIdentifier(value.id);

  if (id === null) {
    return null;
  }

  const motherId = parseIdentifier(value.mother_id ?? value.motherId);
  const pakarId = parseIdentifier(value.pakar_id ?? value.pakarId);
  const status = parseOptionalString(value.status);
  const notes = parseNullableString(value.notes);
  const createdAt = parseOptionalString(value.created_at ?? value.createdAt);
  const updatedAt = parseOptionalString(value.updated_at ?? value.updatedAt);

  return {
    id,
    motherId: motherId ?? null,
    pakarId: pakarId ?? null,
    status,
    notes,
    createdAt,
    updatedAt,
    mother: value.mother,
    pakar: value.pakar,
  };
};

const normalizeConsultationList = (value: unknown): Consultation[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => parseConsultation(item))
      .filter((item): item is Consultation => Boolean(item));
  }

  const single = parseConsultation(value);

  return single ? [single] : [];
};

export interface ConsultationQueryOptions {
  motherId?: string | number;
  pakarId?: string | number;
  status?: string;
}

const sortConsultationsByDateDesc = (a: Consultation, b: Consultation) => {
  const toTime = (input?: string) => {
    if (!input) {
      return 0;
    }

    const time = new Date(input).getTime();

    return Number.isFinite(time) ? time : 0;
  };

  const aTime = toTime(a.updatedAt ?? a.createdAt);
  const bTime = toTime(b.updatedAt ?? b.createdAt);

  return bTime - aTime;
};

export const fetchLatestConsultation = async (
  options: ConsultationQueryOptions = {}
): Promise<Consultation | null> => {
  const params: Record<string, string | number> = {};

  if (options.motherId !== undefined) {
    params.mother_id = options.motherId;
  }

  if (options.pakarId !== undefined) {
    params.pakar_id = options.pakarId;
  }

  if (options.status !== undefined) {
    params.status = options.status;
  }

  try {
    const { data } = await api.get<ApiResponse<unknown> | ApiErrorResponse>(
      "/api/consultations",
      {
        params,
      }
    );

    if (!data.status) {
      throw createApiError(data as ApiErrorResponse);
    }

    const consultations = normalizeConsultationList(
      (data as ApiResponse<unknown>).data
    );

    if (consultations.length === 0) {
      return null;
    }

    consultations.sort(sortConsultationsByDateDesc);

    return consultations[0] ?? null;
  } catch (error) {
    const normalizedError = normalizeApiError(error);

    if (/not found/i.test(normalizedError.message)) {
      return null;
    }

    throw normalizedError;
  }
};

export interface ConsultationMessage {
  id: string | number;
  sender: string;
  text: string;
  createdAt?: string;
  humanize?: string;
}

const parseConsultationMessage = (
  value: unknown
): ConsultationMessage | null => {
  if (!isRecord(value)) {
    return null;
  }

  const id = parseIdentifier(value.id);

  if (id === null) {
    return null;
  }

  const textValue = typeof value.text === "string" ? value.text : "";
  const sender = typeof value.sender === "string" ? value.sender : "system";
  const createdAt = parseOptionalString(value.created_at ?? value.createdAt);
  const humanize = parseOptionalString(value.humanize);

  return {
    id,
    sender,
    text: textValue,
    createdAt,
    humanize,
  };
};

const normalizeConsultationMessages = (
  value: unknown
): ConsultationMessage[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => parseConsultationMessage(item))
      .filter((item): item is ConsultationMessage => Boolean(item));
  }

  const single = parseConsultationMessage(value);

  return single ? [single] : [];
};

export const fetchConsultationMessages = async (
  consultationId: string | number
): Promise<ConsultationMessage[]> => {
  const { data } = await api.get<ApiResponse<unknown> | ApiErrorResponse>(
    `/api/consultations/${consultationId}/messages`
  );

  if (!data.status) {
    throw createApiError(data as ApiErrorResponse);
  }

  return normalizeConsultationMessages((data as ApiResponse<unknown>).data);
};

export interface SendConsultationMessagePayload {
  consultationId: string | number;
  text: string;
}

export const sendConsultationMessage = async ({
  consultationId,
  text,
}: SendConsultationMessagePayload): Promise<ConsultationMessage> => {
  const { data } = await api.post<ApiResponse<unknown> | ApiErrorResponse>(
    "/api/messages",
    {
      consultation_id: consultationId,
      text,
    }
  );

  if (!data.status) {
    throw createApiError(data as ApiErrorResponse);
  }

  const message = parseConsultationMessage((data as ApiResponse<unknown>).data);

  if (!message) {
    throw new ApiRequestError("Invalid message response from server", {
      payload: (data as ApiResponse<unknown>).data,
    });
  }

  return message;
};

export default api;
