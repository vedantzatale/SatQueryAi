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
  execution_id: string | null;
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

/* --- Conversational & Interactive Earth Observation Types --- */

export type SensorType = "Sentinel-2" | "Sentinel-1 SAR" | "Landsat-8/9" | "MODIS" | "Custom GeoTIFF";

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  sensor?: SensorType | string;
  resolution?: string;
  date?: string;
  role?: "optical" | "sar" | "baseline" | "comparison";
}

export interface DetectedChangeClass {
  name: string;
  areaHa: number;
  percentage: number;
}

export interface ChangeAnalysisData {
  beforeImage: string;
  afterImage: string;
  changeMaskImage: string;
  beforeDate: string;
  afterDate: string;
  sensor: string;
  areaHa: number;
  changeType: string;
  summary: string;
  detectedClasses: DetectedChangeClass[];
}

export interface MultimodalData {
  opticalImage: string;
  sarImage: string;
  fusedImage: string;
  opticalSensor: string;
  sarSensor: string;
  opticalInsight: string;
  sarInsight: string;
  fusedInsight: string;
}

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  coordinates: [number, number, number, number]; // [ymin, xmin, ymax, xmax] or UTM box
}

export interface EvidenceData {
  sourceImage: string;
  highlightedImage?: string;
  changeMask?: string;
  boundingBoxes?: BoundingBox[];
  aoi?: {
    name: string;
    coordinates: string;
    crs?: string;
    areaSqKm?: number;
  };
  metrics?: {
    label: string;
    value: string;
    change?: string;
  }[];
}

export interface ExecutionStep {
  name: string;
  status: "completed" | "running" | "failed" | "pending";
  durationMs: number;
  description: string;
}

export interface AnalysisTrace {
  task: string;
  sensor: string;
  dateRange?: string;
  models: string[];
  confidence: number;
  confidenceTier: "High" | "Moderate" | "Calculated";
  outputType: string;
  executionSteps: ExecutionStep[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  analysisTrace?: AnalysisTrace;
  evidence?: EvidenceData;
  changeAnalysis?: ChangeAnalysisData;
  multimodal?: MultimodalData;
  execution_id?: string | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  temporary: boolean;
  category: "Today" | "Yesterday" | "Previous 7 Days" | "Older";
  activeTask?: string;
  aoiName?: string;
  messages: Message[];
}

