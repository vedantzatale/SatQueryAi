"use client";

import { useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

export function ShareModal() {
  const shareModalOpen = useAppStore((s) => s.shareModalOpen);
  const setShareModalOpen = useAppStore((s) => s.setShareModalOpen);
  const activeSessionTitle = useAppStore((s) => s.activeSessionTitle);
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  if (!shareModalOpen) return null;

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://satquery.ai/app";

  function handleCopy() {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        // Clipboard permission denied or unavailable -- leave the button
        // showing "Copy link" rather than falsely claiming it succeeded.
      });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-5 ${
        isLight ? "border-black/10 bg-[#fcfbf8] text-[#18181b]" : "border-white/15 bg-[#0f0f0f]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className={`h-4 w-4 ${isLight ? "text-neutral-700" : "text-neutral-300"}`} />
            <h2 className={`text-base font-medium ${isLight ? "text-[#18181b]" : "text-white"}`}>Share conversation</h2>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className={`rounded-lg p-1 transition-colors ${isLight ? "text-neutral-500 hover:text-black hover:bg-black/5" : "text-neutral-400 hover:text-white"}`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
          Anyone with this link will be able to view this Earth observation conversation,
          including attached imagery and evidence reports.
        </p>

        <div className={`flex items-center gap-2 rounded-xl border p-2 ${
          isLight ? "border-black/10 bg-[#ede8df]" : "border-white/10 bg-[#080808]"
        }`}>
          <input
            type="text"
            readOnly
            value={shareUrl}
            className={`flex-1 bg-transparent px-2 font-mono text-xs focus:outline-none truncate ${
              isLight ? "text-neutral-900" : "text-neutral-300"
            }`}
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isLight ? "bg-[#18181b] text-white hover:bg-[#27272a]" : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShareModalOpen(false)}
            className={`rounded-xl border px-4 py-2 text-xs font-medium transition-colors ${
              isLight
                ? "border-black/10 bg-black/5 text-neutral-800 hover:bg-black/10"
                : "border-white/10 bg-white/5 text-neutral-300 hover:text-white"
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
