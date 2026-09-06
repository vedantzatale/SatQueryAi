"use client";

import { useState } from "react";
import { Check, Copy, Share2, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function ShareModal() {
  const shareModalOpen = useAppStore((s) => s.shareModalOpen);
  const setShareModalOpen = useAppStore((s) => s.setShareModalOpen);
  const activeSessionTitle = useAppStore((s) => s.activeSessionTitle);
  const [copied, setCopied] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f0f0f] p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-neutral-300" />
            <h2 className="text-base font-medium text-white">Share conversation</h2>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="rounded-lg p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-neutral-400">
          Anyone with this link will be able to view this Earth observation conversation,
          including attached imagery and evidence reports.
        </p>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#080808] p-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-2 font-mono text-xs text-neutral-300 focus:outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShareModalOpen(false)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
