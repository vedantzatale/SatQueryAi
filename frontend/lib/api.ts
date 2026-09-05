import axios from "axios";
import type {
  ExecutionResult,
  ImageUploadResponse,
  SessionDetail,
  SessionSummary,
  TransparencyResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export const apiClient = axios.create({ baseURL: API_BASE_URL });

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
