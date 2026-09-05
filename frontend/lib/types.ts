export interface SessionSummary {
  id: string;
  title: string;
  language: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface SessionDetail extends SessionSummary {
  messages: ChatMessage[];
}

export interface ValidationMetadata {
  crs: string | null;
  bounds_geojson: Record<string, unknown> | null;
  resolution_x: number | null;
  resolution_y: number | null;
  band_count: number | null;
  band_descriptions: string[] | null;
  width: number | null;
  height: number | null;
  acquisition_date: string | null;
  sensor: string | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata: ValidationMetadata;
  detected_modality: "optical" | "multispectral" | "sar" | "unknown";
  spatial_reference_available: boolean;
}

export interface ImageUploadResponse {
  image_id: string | null;
  validation: ValidationResult;
}

export interface Evidence {
  type: "original" | "bounding_box" | "polygon" | "change_mask" | "overlay" | "before_after";
  storage_key: string | null;
  coordinates: number[] | null;
  geo_geometry: Record<string, unknown> | null;
  label: string | null;
  score: number | null;
  area_m2: number | null;
  area_percentage: number | null;
}

export interface ConfidenceReport {
  mode: "calibrated" | "demo_heuristic";
  overall_level: "high" | "medium" | "low" | "unavailable";
  model_confidence: number | null;
  input_quality: "good" | "fair" | "poor";
  evidence_quality: "strong" | "moderate" | "weak";
  modality_agreement: "agree" | "disagree" | "not_applicable";
  notes: string[];
}

export interface DataProvenance {
  provider: string | null;
  scene_id: string | null;
  acquisition_date: string | null;
  sensor: string | null;
  aoi: Record<string, unknown> | null;
  crs: string | null;
  resolution: number | null;
  processing_applied: string[];
  retrieved_at: string | null;
}

export interface ModelProvenance {
  model_id: string;
  version: string;
  capability: string;
  configuration: Record<string, unknown>;
  fallback_used: boolean;
  fallback_reason: string | null;
  demo_mode: boolean;
}

export interface ExecutionResult {
  execution_id: string;
  status: string;
  task: string | null;
  model: string | null;
  model_version: string | null;
  answer: string | null;
  evidence: Evidence[];
  confidence: ConfidenceReport | null;
  data_provenance: DataProvenance | null;
  model_provenance: ModelProvenance | null;
  warnings: string[];
  user_message: string | null;
  actions: string[];
  latency_ms: number | null;
}

export interface TransparencyStep {
  step: string;
  status: string;
  detail: Record<string, unknown>;
}

export interface TransparencyResponse {
  task: string | null;
  model: string | null;
  model_version: string | null;
  data_provenance: DataProvenance | null;
  model_provenance: ModelProvenance | null;
  confidence: ConfidenceReport | null;
  warnings: string[];
  processing_steps: TransparencyStep[];
}
