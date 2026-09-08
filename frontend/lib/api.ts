import axios from "axios";
import type {
  ExecutionResult,
  ImageUploadResponse,
  SessionDetail,
  SessionSummary,
  TransparencyResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

// The agent/model pipeline runs real CPU inference with no GPU on the
// current deployment target -- a single query can legitimately take 1-2+
// minutes (measured: ~60s for a trivial text-only query on a warm model).
// No timeout at all risks a genuinely hung request spinning forever, so
// this caps it generously rather than leaving it unbounded.
export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 6 * 60 * 1000 });

export async function createSession(title?: string): Promise<SessionSummary> {
  const { data } = await apiClient.post<SessionSummary>("/sessions", { title });
  return data;
}

export async function listSessions(): Promise<SessionSummary[]> {
  const { data } = await apiClient.get<SessionSummary[]>("/sessions");
  return data;
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
  const { data } = await apiClient.get<SessionDetail>(`/sessions/${sessionId}`);
  return data;
}

export async function renameSession(sessionId: string, title: string): Promise<SessionSummary> {
  const { data } = await apiClient.patch<SessionSummary>(`/sessions/${sessionId}`, { title });
  return data;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}`);
}

export async function uploadImage(sessionId: string, file: File): Promise<ImageUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<ImageUploadResponse>(
    `/images/upload?session_id=${sessionId}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function submitQuery(
  sessionId: string,
  text: string,
  imageIds: string[]
): Promise<{ execution_id: string; status: string }> {
  const { data } = await apiClient.post<{ execution_id: string; status: string }>("/query", {
    session_id: sessionId,
    text,
    image_ids: imageIds,
  });
  return data;
}

export async function getAnalysis(executionId: string): Promise<ExecutionResult> {
  const { data } = await apiClient.get<ExecutionResult>(`/analysis/${executionId}`);
  return data;
}

export async function getTransparency(executionId: string): Promise<TransparencyResponse> {
  const { data } = await apiClient.get<TransparencyResponse>(`/analysis/${executionId}/transparency`);
  return data;
}

export function evidenceImageUrl(storageKey: string): string {
  return `${API_BASE_URL}/storage/${storageKey}`;
}

export function reportPdfUrl(executionId: string): string {
  return `${API_BASE_URL}/analysis/${executionId}/report`;
}

export function reportGeoJsonUrl(executionId: string): string {
  return `${API_BASE_URL}/analysis/${executionId}/geojson`;
}

export interface ModelRegistryEntry {
  model_id: string;
  capability: string[];
  modalities: string[];
  version: string;
  enabled: boolean;
  resource_requirement: string;
  fallback: string | null;
}

export async function listModels(): Promise<ModelRegistryEntry[]> {
  const { data } = await apiClient.get<{ models: ModelRegistryEntry[] }>("/models");
  return data.models;
}

export interface ModelHealth {
  model_id: string;
  status: string;
  is_mock?: boolean;
  version?: string;
  reason?: string;
}

export async function getModelHealth(modelId: string): Promise<ModelHealth> {
  const { data } = await apiClient.get<ModelHealth>(`/models/${modelId}/health`);
  return data;
}

export interface ProviderStatus {
  provider: string;
  status: "healthy" | "unavailable_no_credentials" | "unavailable_error";
  message: string | null;
}

export async function getProviderStatus(): Promise<ProviderStatus[]> {
  const { data } = await apiClient.get<{ providers: ProviderStatus[] }>("/satellite/providers/status");
  return data.providers;
}
