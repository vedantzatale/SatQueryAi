"use client";

import { useRef, useState } from "react";
import { ArrowUp, Brain, Image as ImageIcon, Mic, Plus, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

interface ComposerProps {
  onSend: (text: string) => void;
  onUploadFiles: (files: File[]) => void;
  isLoading: boolean;
  placeholder?: string;
  isCentered?: boolean;
}

export function Composer({
  onSend,
  onUploadFiles,
  isLoading,
  placeholder,
  isCentered = false,
}: ComposerProps) {
  const [text, setText] = useState("");
  const [thinkingMode, setThinkingMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const pendingAttachments = useAppStore((s) => s.pendingAttachments);
  const removePendingAttachment = useAppStore((s) => s.removePendingAttachment);

  function toggleVoiceInput() {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      // Fallback if browser doesn't have Web Speech API
      setText((prev) => (prev ? `${prev} Analyze flood extent using Sentinel-1 SAR imagery.` : "Analyze flood extent using Sentinel-1 SAR imagery."));
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }

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
      className={`w-full max-w-3xl mx-auto px-4 transition-all ${
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
                className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#1e1e1e] p-2 pr-3 shadow-lg"
              >
                {att.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="h-9 w-9 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 text-neutral-400">
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

      {/* Main ChatGPT Style Pill Input Bar */}
      <div className="relative flex items-center gap-3 rounded-[32px] border border-white/[0.14] bg-[#212121] px-4 py-3 sm:py-3.5 shadow-2xl focus-within:border-white/40 transition-all">
        {/* Attachment + Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
          title="Attach satellite imagery or GeoTIFF"
        >
          <Plus className="h-5 w-5" />
        </button>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask anything"}
          className="flex-1 max-h-48 min-h-[28px] bg-transparent py-1 text-[16px] text-white placeholder:text-[16px] placeholder-neutral-400 focus:outline-none resize-none font-sans leading-relaxed"
        />

        {/* Right Action Icons: Think, Mic, Send */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Think Toggle */}
          <button
            type="button"
            onClick={() => setThinkingMode(!thinkingMode)}
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-[13px] font-medium transition-colors ${
              thinkingMode
                ? "bg-white/20 text-white"
                : "text-neutral-300 hover:text-white hover:bg-white/[0.08]"
            }`}
            title="Toggle Deep Co-registration & Reasoning"
          >
            <Brain className="h-4 w-4" />
            <span>Think</span>
          </button>

          {/* Microphone Voice Icon */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              isListening
                ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]"
                : "text-neutral-300 hover:text-white hover:bg-white/10"
            }`}
            title={isListening ? "Listening... (click to stop)" : "Voice query"}
          >
            <Mic className="h-5 w-5" />
          </button>

          {/* Submit / Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && pendingAttachments.length === 0) || isLoading}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
              (text.trim() || pendingAttachments.length > 0) && !isLoading
                ? "bg-white text-black hover:bg-neutral-200 shadow-md scale-100"
                : "bg-white/[0.08] text-neutral-500 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <ArrowUp className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {!isCentered && (
        <div className="mt-2.5 text-center font-sans text-xs text-neutral-400">
          SatQuery AI synthesizes spatial evidence and coregistered raster indices. Verify mission-critical metrics.
        </div>
      )}
    </div>
  );
}



