"use client";

import { useRef, useState } from "react";
import { ArrowUp, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { useAppStore, type PendingAttachment } from "@/lib/store";

interface ComposerProps {
  onSend: (text: string) => void;
  onUploadFiles: (files: File[]) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function Composer({ onSend, onUploadFiles, isLoading, placeholder }: ComposerProps) {
  const [text, setText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pendingAttachments = useAppStore((s) => s.pendingAttachments);
  const removePendingAttachment = useAppStore((s) => s.removePendingAttachment);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if ((!text.trim() && pendingAttachments.length === 0) || isLoading) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    onUploadFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(Array.from(e.dataTransfer.files));
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-expand textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`w-full max-w-3xl mx-auto px-4 pb-4 pt-2 transition-all ${
        dragActive ? "opacity-90" : ""
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".tif,.tiff,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attachment Previews Area (Single, Before/After, Optical/SAR) */}
      {pendingAttachments.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2.5 animate-fade-in">
          {pendingAttachments.map((att, idx) => {
            let roleLabel = att.role;
            if (!roleLabel) {
              if (pendingAttachments.length === 2) {
                roleLabel = idx === 0 ? "before" : "after";
              } else {
                roleLabel = "single";
              }
            }

            return (
              <div
                key={att.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-[#121212] p-2 pr-3 shadow-lg"
              >
                {att.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="h-9 w-9 rounded-lg object-cover border border-white/10"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                )}

                <div className="flex flex-col font-mono text-[11px] max-w-[140px]">
                  <span className="truncate text-white font-medium">{att.name}</span>
                  <span className="uppercase text-[9px] text-neutral-400">
                    {roleLabel} · {att.type}
                  </span>
                </div>

                <button
                  onClick={() => removePendingAttachment(att.id)}
                  className="rounded-full p-1 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Remove Attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative flex items-end gap-2 rounded-2xl border border-white/15 bg-[#121212] p-2 sm:p-2.5 shadow-2xl focus-within:border-white/40 transition-colors">
        {/* Attachment Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-neutral-400 hover:bg-white/10 hover:text-white transition-all"
          title="Upload satellite imagery (GeoTIFF, PNG, JPEG)"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask questions about Earth observation data, compare dates, or inspect features..."}
          className="flex-1 max-h-44 min-h-[28px] bg-transparent py-1 text-sm text-white placeholder-neutral-500 focus:outline-none resize-none font-sans leading-relaxed"
        />

        {/* Submit / Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && pendingAttachments.length === 0) || isLoading}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
            (text.trim() || pendingAttachments.length > 0) && !isLoading
              ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
              : "bg-white/5 text-neutral-500 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 text-center font-sans text-[11px] text-neutral-500">
        SatQuery AI synthesizes spatial evidence and coregistered raster indices. Verify mission-critical metrics.
      </div>
    </div>
  );
}

