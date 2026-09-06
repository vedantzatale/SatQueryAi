"use client";

import { Download, Globe, Menu, Share2, Shield, ShieldAlert } from "lucide-react";
import { reportGeoJsonUrl, reportPdfUrl } from "@/lib/api";
import { useAppStore } from "@/lib/store";

interface ChatHeaderProps {
  onToggleMobileSidebar: () => void;
}

export function ChatHeader({ onToggleMobileSidebar }: ChatHeaderProps) {
  const activeSessionTitle = useAppStore((s) => s.activeSessionTitle);
  const isTemporaryChat = useAppStore((s) => s.isTemporaryChat);
  const setIsTemporaryChat = useAppStore((s) => s.setIsTemporaryChat);
  const setShareModalOpen = useAppStore((s) => s.setShareModalOpen);
  const setMapModalOpen = useAppStore((s) => s.setMapModalOpen);
  const lastResult = useAppStore((s) => s.lastResult);

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-white/10 bg-[#090909] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-neutral-400 hover:text-white"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
            {activeSessionTitle || "New Analysis"}
          </h1>

          {isTemporaryChat && (
            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300">
              Temporary Chat
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
        {/* Interactive Satellite Map Modal Trigger */}
        <button
          onClick={() => setMapModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
          title="Inspect AOI Geographic Boundary"
        >
          <Globe className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Map</span>
        </button>

        {/* Temporary Chat Toggle */}
        <button
          onClick={() => setIsTemporaryChat(!isTemporaryChat)}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
            isTemporaryChat
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
              : "border-white/10 bg-white/5 text-neutral-400 hover:text-white"
          }`}
          title={
            isTemporaryChat
              ? "Temporary chat enabled (won't save to history)"
              : "Click to enable temporary chat"
          }
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isTemporaryChat ? "Temporary" : "Save History"}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* PDF Export Download shortcut if execution exists */}
        {lastResult?.execution_id && (
          <a
            href={reportPdfUrl(lastResult.execution_id)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-medium text-black hover:bg-neutral-200 transition-colors"
            title="Download PDF Dossier"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">PDF</span>
          </a>
        )}
      </div>
    </header>
  );
}
