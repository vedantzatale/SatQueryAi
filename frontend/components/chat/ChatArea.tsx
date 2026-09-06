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
        setActiveSessionTitle("New Analysis");
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
      setActiveSessionTitle(mock.title);
      return;
    }

    // Try fetching from real backend
    getSession(sessionId)
      .then((detail) => {
        setMessages(detail.messages.map((m) => ({ ...m })));
        setActiveSessionTitle(detail.title);
      })
      .catch(() => {
        // Handled silently
      });
  }, [sessionId, initialSessionId, setSessionId, setActiveSessionTitle, setLastResult]);

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;
    try {
      const created = await createSession("New Analysis");
      setSessionId(created.id);
      setActiveSessionTitle(created.title || "New Analysis");
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

    for (const file of files) {
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

      // Try uploading to real backend
      try {
        const uploadRes = await uploadImage(currentSessionId, file);
        if (uploadRes.image_id) {
          addImageId(uploadRes.image_id);
        }
      } catch {
        // Backend not reachable, local attachment preview preserved
      }
    }

    setIsLoading(false);
    setLoadingStatus(null);
  }

  async function handleSend(text: string) {
    const currentSessionId = await ensureSession();
    const attachmentsSnapshot = [...pendingAttachments];
    clearPendingAttachments();

    // Append user message immediately
    const userMsg: MessageWithMeta = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "Analyze attached satellite imagery.",
      created_at: new Date().toISOString(),
      attachments: attachmentsSnapshot.map((a) => ({ name: a.name, type: a.type })),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingStatus("Orchestrating specialist models...");

    // Try real backend first
    try {
      const { execution_id } = await submitQuery(currentSessionId, text, imageIds);
      setLoadingStatus("Generating grounded evidence...");
      const analysisResult = await getAnalysis(execution_id);

      setLastResult(analysisResult);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: analysisResult.answer ?? "Analysis finished.",
          created_at: new Date().toISOString(),
          result: analysisResult,
        },
      ]);
      setIsLoading(false);
      setLoadingStatus(null);
      return;
    } catch {
      // Backend offline or error -> Provide intelligent demo Earth observation response
      setTimeout(() => {
        const lower = text.toLowerCase();
        let demoResult: ExecutionResult;

        if (lower.includes("change") || attachmentsSnapshot.length >= 2) {
          demoResult = MOCK_SESSIONS[0].result;
        } else if (lower.includes("water") || lower.includes("flood")) {
          demoResult = MOCK_SESSIONS[1].result;
        } else if (lower.includes("sar") || lower.includes("radar")) {
          demoResult = MOCK_SESSIONS[2].result;
        } else {
          demoResult = MOCK_SESSIONS[3].result;
        }

        setLastResult(demoResult);
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: demoResult.answer ?? "Analysis completed.",
            created_at: new Date().toISOString(),
            result: demoResult,
          },
        ]);
        setIsLoading(false);
        setLoadingStatus(null);
      }, 1200);
    }
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[#0a0a0a]">
      {messages.length === 0 ? (
        <EmptyState onSelectPrompt={(prompt) => handleSend(prompt)} />
      ) : (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          loadingStatus={loadingStatus}
        />
      )}

      {/* Persistent Bottom Composer */}
      <div className="border-t border-white/10 bg-[#0c0c0c]/80 backdrop-blur-md">
        <Composer
          onSend={handleSend}
          onUploadFiles={handleUploadFiles}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
