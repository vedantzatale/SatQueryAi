"use client";

import { Download, FileJson, Globe, Menu, Share2 } from "lucide-react";
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
    <header className="flex h-14 w-full items-center justify-between border-b border-white/10 bg-[#000000] px-4 sm:px-6">
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
            {activeSessionTitle || "New Satellite Query"}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs">
        {/* Specialist Model Badge */}
        <button
          onClick={() => setMapModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-neutral-300 hover:border-white/20 transition-colors"
          title="Inspect AOI / GeoChat Core"
        >
          <Globe className="h-3 w-3 text-neutral-400" />
          <span>GeoChat • Sentinel Core</span>
        </button>

        {/* Temporary Toggle */}
        <button
          onClick={() => setIsTemporaryChat(!isTemporaryChat)}
          className={`flex items-center gap-1.5 px-2 py-1 transition-colors text-xs ${
            isTemporaryChat ? "text-amber-400 font-medium" : "text-neutral-400 hover:text-white"
          }`}
          title={isTemporaryChat ? "Temporary chat enabled" : "Toggle temporary chat"}
        >
          <span className={`text-[12px] leading-none ${isTemporaryChat ? "text-amber-400" : "text-neutral-500"}`}>
            •
          </span>
          <span>Temporary</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </button>


        {/* Export shortcuts if a completed execution exists */}
        {lastResult?.execution_id && (
          <>
            <a
              href={reportGeoJsonUrl(lastResult.execution_id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-neutral-200 hover:bg-white/10 hover:text-white transition-colors"
              title="Download GeoJSON"
            >
              <FileJson className="h-3.5 w-3.5" />
              <span className="hidden md:inline">GeoJSON</span>
            </a>
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
          </>
        )}
      </div>
    </header>
  );
}

