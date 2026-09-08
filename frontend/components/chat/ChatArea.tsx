"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList, type MessageWithMeta } from "./MessageList";
import { createSession, getAnalysis, getSession, submitQuery, uploadImage } from "@/lib/api";
import { INITIAL_CONVERSATIONS, MOCK_SESSIONS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import type { Attachment, ExecutionResult, Message } from "@/lib/types";

interface ChatAreaProps {
  initialSessionId?: string | null;
}

// The full pipeline (task planning + specialist models) runs real,
// uncached CPU inference and can legitimately take 1-2+ minutes -- never
// silently swap in canned/fabricated content on failure (that happened
// here before and was indistinguishable from a real, confident answer).
// Always surface what actually went wrong instead.
function describeRequestError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (err.code === "ECONNABORTED") {
      return "The request timed out after several minutes without a response. The model may be overloaded -- please try again.";
    }
    if (!err.response) {
      return "Could not reach the SatQuery backend. Please make sure the server is running and try again.";
    }
    return `The server returned an error (HTTP ${err.response.status}). Please try again.`;
  }
  return "An unexpected error occurred while processing this request.";
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
    // "session-new" is the store's default before any real session exists
    // (not a real id), and "temp-*" is a client-only placeholder for a
    // temporary chat or an offline fallback -- neither has a matching row
    // in the sessions table. Treating either as "already have a session"
    // skipped createSession() entirely, so every query submitted a
    // session_id nothing referenced: SQLite silently accepted the dangling
    // insert, but a real FK-enforcing database (Postgres/Neon) rejects it,
    // which surfaced as every query failing and silently falling back to
    // the canned offline-demo response below instead of a real answer.
    const hasRealSession = sessionId && sessionId !== "session-new" && !sessionId.startsWith("temp-");
    if (hasRealSession) return sessionId as string;
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

    // A new upload REPLACES the active image set rather than growing it.
    // Without this, image ids accumulated for the whole session and every
    // query shipped all of them, so a single-image task ran against
    // contexts[0] -- the first image ever attached -- instead of the one
    // just uploaded. Follow-up questions with no new upload still reuse the
    // existing set, which is what makes multi-turn Q&A on one image work.
    clearImages();

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

  function appendErrorMessage(err: unknown) {
    setMessages((prev) => [
      ...prev,
      {
        id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: "assistant",
        content: describeRequestError(err),
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        execution_id: null,
        isError: true,
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

    // No GPU on the current deployment target -- a real response can
    // legitimately take 1-2+ minutes (measured live: ~60s for a trivial
    // text-only query on an already-warm model). These keep the wait
    // honest instead of looking stuck, without ever inventing a result.
    const statusTimers = [
      setTimeout(
        () => setLoadingStatus("Still working — on-device models run on CPU here, this can take a minute or two..."),
        8000
      ),
      setTimeout(
        () => setLoadingStatus("Still running — large model inference without a GPU is slow but it's genuinely in progress..."),
        30000
      ),
    ];

    try {
      const { execution_id } = await submitQuery(currentSessionId, effectiveText, imageIds);
      setLoadingStatus("Generating grounded evidence...");
      const analysisResult = await getAnalysis(execution_id);
      appendAssistantMessage(analysisResult);
    } catch (err) {
      appendErrorMessage(err);
    } finally {
      statusTimers.forEach(clearTimeout);
      setIsLoading(false);
      setLoadingStatus(null);
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

    // Remove the target assistant message to animate new stream
    setMessages((prev) => prev.filter((_, idx) => idx < targetIdx));

    setIsLoading(true);
    setLoadingStatus("Re-orchestrating specialist models...");

    const statusTimers = [
      setTimeout(
        () => setLoadingStatus("Still working — on-device models run on CPU here, this can take a minute or two..."),
        8000
      ),
    ];

    const currentSessionId = await ensureSession();
    try {
      const { execution_id } = await submitQuery(currentSessionId, queryText, imageIds);
      setLoadingStatus("Synthesizing updated spatial evidence...");
      const analysisResult = await getAnalysis(execution_id);
      appendAssistantMessage(analysisResult);
    } catch (err) {
      appendErrorMessage(err);
    } finally {
      statusTimers.forEach(clearTimeout);
      setIsLoading(false);
      setLoadingStatus(null);
    }
  }

  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div className={`flex flex-1 flex-col h-full overflow-hidden ${isLight ? "bg-[#f5f2eb] text-[#18181b]" : "bg-[#000000] text-white"} transition-colors duration-200`}>
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center -mt-16 px-4 w-full max-w-[840px] mx-auto animate-in fade-in duration-200">
          {isTemporaryChat ? (
            <div className="flex flex-col items-center text-center mb-8 select-none">
              <h1 className={`text-3xl sm:text-4xl md:text-[34px] font-semibold tracking-tight mb-2.5 font-sans ${isLight ? "text-[#18181b]" : "text-white"}`}>
                Temporary chat
              </h1>
              <p className={`text-[14px] sm:text-[15px] font-normal max-w-xl font-sans leading-relaxed ${isLight ? "text-[#52525b]" : "text-[#888888]"}`}>
                This chat can reference memory, plugins, and custom instructions, but it won&apos;t appear in your history.
              </p>
            </div>
          ) : (
            <h1 className={`text-3xl sm:text-4xl md:text-[34px] font-semibold tracking-tight mb-8 text-center font-sans select-none ${isLight ? "text-[#18181b]" : "text-white"}`}>
              What&#39;s on your mind today?
            </h1>
          )}

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
          <div className={`w-full ${isLight ? "bg-[#f5f2eb]" : "bg-[#000000]"} pb-4 pt-2 transition-colors duration-200`}>
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
