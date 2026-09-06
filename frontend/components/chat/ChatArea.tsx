"use client";

import { useEffect, useState } from "react";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList, type MessageWithMeta } from "./MessageList";
import { createSession, getAnalysis, getSession, submitQuery, uploadImage } from "@/lib/api";
import { MOCK_SESSIONS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import type { ExecutionResult } from "@/lib/types";

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
      // If initialSessionId provided, set it
      if (initialSessionId) {
        setSessionId(initialSessionId);
      } else {
        setMessages([]);
        setLastResult(null);
        setActiveSessionTitle("New Satellite Query");
      }
      return;
    }

    // Check mock sessions first
    const mock = MOCK_SESSIONS.find((s) => s.id === sessionId);
    if (mock) {
      setMessages(
        mock.detail.messages.map((m, idx) => ({
          ...m,
          result: idx === mock.detail.messages.length - 1 ? mock.result : null,
        }))
      );
      setLastResult(mock.result);
      return;
    }

    // Try fetching from real backend. Guards against a stale response
    // overwriting a newer session's state if the user switches sessions
    // again before this resolves.
    let cancelled = false;
    getSession(sessionId)
      .then(async (detail) => {
        if (cancelled) return;
        // Restore the full result (evidence, confidence, transparency, map)
        // for every message that has one, not just plain text.
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
      // Fallback session ID for offline demo
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

    // Attachment previews are added synchronously up front, then all
    // uploads run in parallel rather than blocking one-by-one on each
    // network round-trip.
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
          type: isSar ? "sar" : isOptical ? "optical" : "optical",
          sensor: isSar ? "Sentinel-1 C-SAR" : "Sentinel-2 MSI",
        });

        try {
          const uploadRes = await uploadImage(currentSessionId, file);
          if (uploadRes.image_id) {
            addImageId(uploadRes.image_id);
          }
        } catch {
          // Backend not reachable, local attachment preview preserved
        }
      })
    );

    setIsLoading(false);
    setLoadingStatus(null);
  }

  // Mirrors the backend's own priority for what a result "says": a real
  // completed answer, else the real explanation for why it couldn't
  // complete (REQUIRES_USER_INPUT / FAILED carry this in user_message, not
  // answer) -- see app/services/analysis_service.py, which persists
  // messages the same way. Never a fabricated status string.
  function appendAssistantMessage(result: ExecutionResult) {
    const content = result.answer ?? result.user_message ?? "The analysis did not return a message.";
    setLastResult(result);
    setMessages((prev) => [
      ...prev,
      {
        id: `asst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        content,
        created_at: new Date().toISOString(),
        execution_id: result.execution_id,
        result,
      },
    ]);
  }

  async function handleSend(text: string) {
    const currentSessionId = await ensureSession();
    const attachmentsSnapshot = [...pendingAttachments];
    clearPendingAttachments();

    // Attach-and-send-with-no-question is a real, common flow -- send the
    // same fallback text to the backend that's shown in the UI, instead of
    // an empty string the backend has no choice but to reject.
    const effectiveText = text || "Analyze attached satellite imagery.";

    // Append user message immediately
    const userMsg: MessageWithMeta = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: "user",
      content: effectiveText,
      created_at: new Date().toISOString(),
      execution_id: null,
      attachments: attachmentsSnapshot.map((a) => ({ name: a.name, type: a.type })),
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
      // Backend offline or error -> Provide intelligent demo Earth observation response
      setTimeout(() => {
        const lower = text.toLowerCase();
        let demoResult: ExecutionResult;

        if (lower.includes("change") || attachmentsSnapshot.length >= 2) {
          demoResult = MOCK_SESSIONS[1].result;
        } else if (lower.includes("water") || lower.includes("flood")) {
          demoResult = MOCK_SESSIONS[2].result;
        } else if (lower.includes("sar") || lower.includes("radar")) {
          demoResult = MOCK_SESSIONS[3].result;
        } else {
          demoResult = MOCK_SESSIONS[4].result;
        }

        appendAssistantMessage(demoResult);
        setIsLoading(false);
        setLoadingStatus(null);
      }, 1200);
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#000000]">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center -mt-16 px-4 w-full max-w-[840px] mx-auto animate-fade-in">
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

          <div className="mt-4 text-center font-sans text-xs text-neutral-400">
            SatQuery AI synthesizes spatial evidence and coregistered raster indices. Verify mission-critical metrics.
          </div>
        </div>
      ) : (

        <>
          <MessageList
            messages={messages}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
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


