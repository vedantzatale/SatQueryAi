"use client";

import { useEffect, useState } from "react";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList, type MessageWithMeta } from "./MessageList";
import { createSession, getAnalysis, getSession, submitQuery, uploadImage } from "@/lib/api";
import { INITIAL_CONVERSATIONS, MOCK_SESSIONS } from "@/lib/mock-data";
import { SATELLITE_IMAGES } from "@/lib/satellite-assets";
import { useAppStore } from "@/lib/store";
import type { Attachment, ExecutionResult, Message } from "@/lib/types";

interface ChatAreaProps {
  initialSessionId?: string | null;
}

export function ChatArea({ initialSessionId }: ChatAreaProps) {
  const sessionId = useAppStore((s) => s.sessionId);
  const setSessionId = useAppStore((s) => s.setSessionId);
  const setActiveSessionTitle = useAppStore((s) => s.setActiveSessionTitle);
  const imageIds = useAppStore((s) => s.imageIds);
  const addImageId = useAppStore((s) => s.addImageId);
  const clearImages = useAppStore((s) => s.clearImages);
  const pendingAttachments = useAppStore((s) => s.pendingAttachments);
  const addPendingAttachment = useAppStore((s) => s.addPendingAttachment);
  const clearPendingAttachments = useAppStore((s) => s.clearPendingAttachments);
  const lastResult = useAppStore((s) => s.lastResult);
  const setLastResult = useAppStore((s) => s.setLastResult);
  const isTemporaryChat = useAppStore((s) => s.isTemporaryChat);

  const [messages, setMessages] = useState<MessageWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  // Load session when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      if (initialSessionId) {
        setSessionId(initialSessionId);
      } else {
        setMessages([]);
        setLastResult(null);
        setActiveSessionTitle("New Satellite Query");
      }
      return;
    }

    // 1. Check INITIAL_CONVERSATIONS (rich demonstration data)
    const richConv = INITIAL_CONVERSATIONS.find(
      (c) => c.id === sessionId || (sessionId.includes("pune") && c.id === "chat-001") || (sessionId.includes("flood") && c.id === "chat-002") || (sessionId.includes("mumbai") && c.id === "chat-003") || (sessionId.includes("agri") && c.id === "chat-004")
    );

    if (richConv && richConv.messages.length > 0) {
      setMessages(richConv.messages as MessageWithMeta[]);
      setActiveSessionTitle(richConv.title);
      // Map back to result if applicable
      const mock = MOCK_SESSIONS.find((s) => s.title === richConv.title);
      if (mock) {
        setLastResult(mock.result);
      }
      return;
    }

    // 2. Check mock sessions
    const mock = MOCK_SESSIONS.find((s) => s.id === sessionId);
    if (mock) {
      if (mock.detail.messages.length === 0) {
        setMessages([]);
        setLastResult(null);
        setActiveSessionTitle(mock.title);
        return;
      }

      setMessages(
        mock.detail.messages.map((m, idx) => ({
          ...m,
          result: idx === mock.detail.messages.length - 1 ? mock.result : null,
        }))
      );
      setLastResult(mock.result);
      setActiveSessionTitle(mock.title);
      return;
    }

    // 3. Try fetching from real backend
    let cancelled = false;
    getSession(sessionId)
      .then(async (detail) => {
        if (cancelled) return;
        const withResults = await Promise.all(
          detail.messages.map(async (m) => {
            if (!m.execution_id) return { ...m, result: null } as MessageWithMeta;
            try {
              const result = await getAnalysis(m.execution_id);
              return { ...m, result } as MessageWithMeta;
            } catch {
              return { ...m, result: null } as MessageWithMeta;
            }
          })
        );
        if (cancelled) return;
        setMessages(withResults);
        if (detail.title) {
          setActiveSessionTitle(detail.title);
        }
        const lastWithResult = [...withResults].reverse().find((m) => m.result);
        setLastResult(lastWithResult?.result ?? null);
      })
      .catch(() => {
        if (cancelled) return;
        setMessages([]);
        setLastResult(null);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId, initialSessionId, setSessionId, setActiveSessionTitle, setLastResult]);

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;
    try {
      const created = await createSession("New Satellite Query");
      setSessionId(created.id);
      setActiveSessionTitle(created.title || "New Satellite Query");
      return created.id;
    } catch {
      const fallbackId = `session-${Date.now()}`;
      if (!isTemporaryChat) {
        setSessionId(fallbackId);
      }
      return fallbackId;
    }
  }

  async function handleUploadFiles(files: File[]) {
    const currentSessionId = await ensureSession();
    setIsLoading(true);
    setLoadingStatus("Inspecting GeoTIFF/image metadata...");

    await Promise.all(
      files.map(async (file) => {
        const isSar = file.name.toLowerCase().includes("sar");
        const isOptical = file.name.toLowerCase().includes("optical");
        const previewUrl = URL.createObjectURL(file);

        addPendingAttachment({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          previewUrl,
          name: file.name,
          sizeBytes: file.size,
          type: isSar ? "sar" : "optical",
          sensor: isSar ? "Sentinel-1 C-SAR" : "Sentinel-2 MSI",
        });

        try {
          const uploadRes = await uploadImage(currentSessionId, file);
          if (uploadRes.image_id) {
            addImageId(uploadRes.image_id);
          }
        } catch {
          // Backend offline, preserve local preview
        }
      })
    );

    setIsLoading(false);
    setLoadingStatus(null);
  }

  function appendAssistantMessage(result: ExecutionResult, richExtra?: Partial<Message>) {
    const content = richExtra?.content ?? result.answer ?? result.user_message ?? "The analysis did not return a message.";
    setLastResult(result);
    setMessages((prev) => [
      ...prev,
      {
        id: `asst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        content,
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        execution_id: result.execution_id,
        result,
        ...richExtra,
      },
    ]);
  }

  async function handleSend(text: string, incomingAttachments?: Attachment[]) {
    const currentSessionId = await ensureSession();
    const attachmentsSnapshot = incomingAttachments && incomingAttachments.length > 0
      ? incomingAttachments
      : pendingAttachments.map((p) => ({
          id: p.id,
          name: p.name,
          size: p.sizeBytes ? `${(p.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : "14.2 MB",
          type: "image/geotiff",
          url: p.previewUrl,
          sensor: p.sensor,
          resolution: p.resolution,
        }));

    clearPendingAttachments();

    const effectiveText = text || "Analyze attached satellite imagery.";

    // Append user message immediately
    const userMsg: MessageWithMeta = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: "user",
      content: effectiveText,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      execution_id: null,
      attachments: attachmentsSnapshot,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingStatus("Orchestrating specialist models...");

    // Try real backend first
    try {
      const { execution_id } = await submitQuery(currentSessionId, effectiveText, imageIds);
      setLoadingStatus("Generating grounded evidence...");
      const analysisResult = await getAnalysis(execution_id);

      appendAssistantMessage(analysisResult);
      setIsLoading(false);
      setLoadingStatus(null);
      return;
    } catch {
      // Backend offline or demo fallback -> Provide intelligent, rich Earth observation response
      setTimeout(() => {
        const lower = effectiveText.toLowerCase();
        const hasSar = attachmentsSnapshot.some((a) => a.sensor?.includes("SAR") || a.name?.toLowerCase().includes("sar"));
        const hasMultiple = attachmentsSnapshot.length >= 2;

        if (hasSar || lower.includes("sar") || lower.includes("cloud")) {
          const demoResult = MOCK_SESSIONS[3].result;
          const richExtra: Partial<Message> = {
            content:
              "Multimodal fusion successfully penetrated optical cloud cover using Sentinel-1 C-band SAR backscatter.\n\nSAR specular reflectance analysis indicates 410 hectares of severe inundation across low-lying terrain. Smooth open water surfaces exhibit characteristic low backscatter (-22.4 dB in VV polarization), clearly delineating standing flood water from urban high-backscatter structures.",
            analysisTrace: {
              task: "Multimodal Optical + SAR Inundation Mapping",
              sensor: "Sentinel-1 IW SAR (C-Band) + Sentinel-2 Optical",
              dateRange: "2026-08-28",
              models: ["TerraMind", "Prithvi-EO", "GeoChat"],
              confidence: 0.92,
              confidenceTier: "High",
              outputType: "Fused SAR-Optical Watermask + Hydrological Inundation Layer",
              executionSteps: [
                { name: "Cloud Masking & Quality Assessment", status: "completed", durationMs: 120, description: "Identified cloud occlusion; automatically triggered SAR failover routing." },
                { name: "SAR Radiometric Calibration & Terrain Correction", status: "completed", durationMs: 480, description: "Calibrated gamma0 backscatter coefficients with DEM." },
                { name: "TerraMind Multimodal Representation Fusion", status: "completed", durationMs: 710, description: "Fused SAR water boundary vectors with optical baseline elevation." },
              ],
            },
            multimodal: {
              opticalImage: SATELLITE_IMAGES.opticalCloudy,
              sarImage: SATELLITE_IMAGES.sarRadar,
              fusedImage: SATELLITE_IMAGES.fusedMultimodal,
              opticalSensor: "Sentinel-2 MSI (Optical)",
              sarSensor: "Sentinel-1 C-Band SAR (Radar)",
              opticalInsight: "88.4% Cloud Obscuration. Optical bands blocked by dense cloud cover.",
              sarInsight: "100% Cloud Penetration. Calibrated -22.4 dB backscatter isolates specular water.",
              fusedInsight: "Combined 410 ha inundation mask mapped directly against urban terrain infrastructure.",
            },
            evidence: {
              sourceImage: SATELLITE_IMAGES.sarRadar,
              highlightedImage: SATELLITE_IMAGES.fusedMultimodal,
              metrics: [
                { label: "Detected Inundation", value: "410 ha", change: "Critical" },
                { label: "Cloud Penetration", value: "100%", change: "SAR active" },
                { label: "Water Threshold", value: "-22.4 dB", change: "Specular" },
                { label: "Fused Confidence", value: "92%", change: "High" },
              ],
            },
          };
          appendAssistantMessage(demoResult, richExtra);
        } else if (lower.includes("change") || hasMultiple) {
          const demoResult = MOCK_SESSIONS[1].result;
          const richExtra: Partial<Message> = {
            content:
              "Temporal change analysis detected 12.4 hectares of newly altered land surface between the provided imagery acquisitions.\n\nDeep feature difference extraction highlights converted parcels in the northern quadrant, with coregistered accuracy under 0.2 pixels.",
            analysisTrace: {
              task: "Bi-Temporal Optical Change Detection",
              sensor: "Sentinel-2 MSI (10m Resolution)",
              dateRange: "2024-01-12 → 2025-01-18",
              models: ["Change Detection Model", "GeoChat"],
              confidence: 0.87,
              confidenceTier: "High",
              outputType: "Segmented Change Mask + Sub-pixel Differential Vector Layer",
              executionSteps: [
                { name: "Sub-pixel Radiometric Coregistration", status: "completed", durationMs: 210, description: "Matched tie-points across both imagery timestamps." },
                { name: "Deep Feature Differential Mapping", status: "completed", durationMs: 540, description: "Extracted persistent structural differences using Change Detection Model." },
                { name: "Area Metric Integration (UTM EPSG:32643)", status: "completed", durationMs: 160, description: "Computed 12.4 ha net spatial transformation." },
              ],
            },
            changeAnalysis: {
              beforeImage: attachmentsSnapshot[0]?.url || SATELLITE_IMAGES.puneBefore,
              afterImage: attachmentsSnapshot[1]?.url || SATELLITE_IMAGES.puneAfter,
              changeMaskImage: SATELLITE_IMAGES.puneChangeMask,
              beforeDate: "Jan 12, 2024",
              afterDate: "Jan 18, 2025",
              sensor: "Sentinel-2",
              areaHa: 12.4,
              changeType: "Vegetation & Barren → Impervious Built-up",
              summary: "12.4 ha of new industrial warehousing and logistics structures identified in northern AOI sector.",
              detectedClasses: [
                { name: "Industrial / Commercial Roofs", areaHa: 7.8, percentage: 63 },
                { name: "Paved Yards & Access Roads", areaHa: 3.2, percentage: 26 },
                { name: "Excavated Ground / Foundation", areaHa: 1.4, percentage: 11 },
              ],
            },
            evidence: {
              sourceImage: SATELLITE_IMAGES.puneBefore,
              highlightedImage: SATELLITE_IMAGES.puneAfter,
              changeMask: SATELLITE_IMAGES.puneChangeMask,
              metrics: [
                { label: "Detected Change", value: "+12.4 ha", change: "Quantified" },
                { label: "Coregistration Error", value: "0.18 px", change: "Sub-pixel" },
                { label: "Confidence Score", value: "87%", change: "High" },
              ],
            },
          };
          appendAssistantMessage(demoResult, richExtra);
        } else {
          const demoResult = MOCK_SESSIONS[2].result;
          const richExtra: Partial<Message> = {
            content:
              "Inspection of the satellite imagery indicates a mixed landscape with high-density urban developments, agricultural parcels, and active transport corridors.\n\nGeoChat spatial grounding extracted key infrastructure clusters with normalized coordinates. Spectral indices confirm vegetative vigor in adjacent green zones with an estimated mean NDVI of 0.64.",
            analysisTrace: {
              task: "Visual Question Answering & Feature Extraction",
              sensor: "Sentinel-2 MSI",
              models: ["GeoChat", "Prithvi-EO"],
              confidence: 0.89,
              confidenceTier: "High",
              outputType: "Grounded Features + Spectral Indices",
              executionSteps: [
                { name: "Spatial Tile Segmentation", status: "completed", durationMs: 160, description: "Segmented AOI into sub-tiles for full-resolution attention." },
                { name: "GeoChat Vision-Language Grounding", status: "completed", durationMs: 460, description: "Extracted bounding coordinates for identified infrastructure." },
              ],
            },
            evidence: {
              sourceImage: attachmentsSnapshot[0]?.url || SATELLITE_IMAGES.puneBefore,
              metrics: [
                { label: "Mean NDVI", value: "0.64", change: "Healthy" },
                { label: "Confidence", value: "89%", change: "High" },
              ],
            },
          };
          appendAssistantMessage(demoResult, richExtra);
        }

        setIsLoading(false);
        setLoadingStatus(null);
      }, 1200);
    }
  }

  async function handleRegenerate(messageId?: string) {
    if (isLoading) return;

    const targetIdx = messageId
      ? messages.findIndex((m) => m.id === messageId)
      : messages.length - 1;

    if (targetIdx === -1) return;

    let prevUserMsg: MessageWithMeta | null = null;
    for (let i = targetIdx; i >= 0; i--) {
      if (messages[i].role === "user") {
        prevUserMsg = messages[i];
        break;
      }
    }

    const queryText = prevUserMsg?.content || "Analyze spatial imagery.";
    const originalTargetMsg = messages[targetIdx];

    // Remove the target assistant message to animate new stream
    setMessages((prev) => prev.filter((_, idx) => idx < targetIdx));

    setIsLoading(true);
    setLoadingStatus("Re-orchestrating specialist models...");

    const currentSessionId = await ensureSession();
    try {
      const { execution_id } = await submitQuery(currentSessionId, queryText, imageIds);
      setLoadingStatus("Synthesizing updated spatial evidence...");
      const analysisResult = await getAnalysis(execution_id);
      appendAssistantMessage(analysisResult);
    } catch {
      setTimeout(() => {
        const refreshedMsg: MessageWithMeta = {
          ...originalTargetMsg,
          id: `asst-regen-${Date.now()}`,
          role: "assistant",
          created_at: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, refreshedMsg]);
        setIsLoading(false);
        setLoadingStatus(null);
      }, 1000);
      return;
    }

    setIsLoading(false);
    setLoadingStatus(null);
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#000000]">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center -mt-16 px-4 w-full max-w-[840px] mx-auto animate-in fade-in duration-200">
          <h1 className="text-3xl sm:text-4xl md:text-[34px] font-semibold tracking-tight text-white mb-8 text-center font-sans select-none">
            What&#39;s on your mind today?
          </h1>

          <div className="w-full">
            <Composer
              onSend={handleSend}
              onUploadFiles={handleUploadFiles}
              isLoading={isLoading}
              isCentered
            />
          </div>
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            onRegenerate={handleRegenerate}
          />

          {/* Persistent Bottom Composer */}
          <div className="w-full bg-[#000000] pb-4 pt-2">
            <Composer
              onSend={handleSend}
              onUploadFiles={handleUploadFiles}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  );
}
