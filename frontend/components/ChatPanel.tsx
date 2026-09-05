"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { createSession, getAnalysis, getSession, submitQuery, uploadImage } from "@/lib/api";
import { useAppStore } from "@/lib/store";

export function ChatPanel() {
  const sessionId = useAppStore((s) => s.sessionId);
  const setSessionId = useAppStore((s) => s.setSessionId);
  const imageIds = useAppStore((s) => s.imageIds);
  const addImageId = useAppStore((s) => s.addImageId);
  const setLastResult = useAppStore((s) => s.setLastResult);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "running" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId as string),
    enabled: !!sessionId,
  });

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;
    const created = await createSession("New Analysis");
    setSessionId(created.id);
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
    return created.id;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const id = await ensureSession();
    setStatus("uploading");
    setStatusMessage("Validating and ingesting imagery...");
    try {
      for (const file of Array.from(files)) {
        const result = await uploadImage(id, file);
        if (!result.image_id) {
          setStatus("error");
          setStatusMessage(result.validation.errors.join(" "));
          return;
        }
        addImageId(result.image_id);
        if (result.validation.warnings.length > 0) {
          setStatusMessage(result.validation.warnings.join(" "));
        }
      }
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setStatusMessage("Upload failed. Please try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    if (!text.trim()) return;
    const id = await ensureSession();
    setStatus("running");
    setStatusMessage("Understanding your query and planning the analysis...");
    try {
      const { execution_id } = await submitQuery(id, text, imageIds);
      const result = await getAnalysis(execution_id);
      setLastResult(result);
      setText("");
      if (result.status === "requires_user_input") {
        setStatusMessage(result.user_message);
      } else if (result.status === "failed") {
        setStatus("error");
        setStatusMessage(result.user_message ?? "Analysis failed.");
      } else {
        setStatus("idle");
        setStatusMessage(null);
      }
      refetchSession();
    } catch (err) {
      setStatus("error");
      setStatusMessage("Something went wrong while running the analysis.");
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="border-b border-slate-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-slate-900">Ask SatQuery about Earth</h1>
        <p className="text-sm text-slate-500">
          Upload imagery, or just ask — SatQuery will figure out what data and models it needs.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!session || session.messages.length === 0 ? (
          <div className="mt-12 text-center text-sm text-slate-400">
            Start by uploading an image or asking a question like &ldquo;What is visible in this
            image?&rdquo; or &ldquo;Has built-up area increased around Pune in the last year?&rdquo;
          </div>
        ) : (
          <div className="space-y-4">
            {session.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-2xl rounded-lg px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
        )}

        {statusMessage && (
          <div
            className={`mt-4 max-w-2xl rounded-lg border px-4 py-2 text-sm ${
              status === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {imageIds.length > 0 && (
          <div className="mt-4 text-xs text-slate-400">
            {imageIds.length} image{imageIds.length > 1 ? "s" : ""} attached to this session.
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".tif,.tiff,.png,.jpg,.jpeg"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Upload Image
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Ask a question about your imagery..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={status === "running" || status === "uploading"}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "running" ? "Analyzing..." : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}
