"use client";

import { useState } from "react";
import {
  Download,
  FileJson,
  Globe,
  Menu,
  MoreHorizontal,
  Share2,
  Shield,
  Sparkles,
} from "lucide-react";
import { reportGeoJsonUrl, reportPdfUrl } from "@/lib/api";
import { useAppStore } from "@/lib/store";

interface ChatHeaderProps {
  onToggleMobileSidebar: () => void;
  isOpenDesktop?: boolean;
  onToggleDesktop?: () => void;
}

export function ChatHeader({
  onToggleMobileSidebar,
  isOpenDesktop = true,
  onToggleDesktop,
}: ChatHeaderProps) {
  const activeSessionTitle = useAppStore((s) => s.activeSessionTitle);
  const setActiveSessionTitle = useAppStore((s) => s.setActiveSessionTitle);
  const isTemporaryChat = useAppStore((s) => s.isTemporaryChat);
  const setIsTemporaryChat = useAppStore((s) => s.setIsTemporaryChat);
  const setShareModalOpen = useAppStore((s) => s.setShareModalOpen);
  const setMapModalOpen = useAppStore((s) => s.setMapModalOpen);
  const lastResult = useAppStore((s) => s.lastResult);
  const resetConversationState = useAppStore((s) => s.resetConversationState);
  const setSessionId = useAppStore((s) => s.setSessionId);
  const [optionsOpen, setOptionsOpen] = useState(false);

  function handleToggleTemporary() {
    if (!isTemporaryChat) {
      resetConversationState();
      setIsTemporaryChat(true);
      setSessionId(`temp-${Date.now()}`);
      setActiveSessionTitle("Temporary Chat");
    } else {
      resetConversationState();
      setIsTemporaryChat(false);
      setSessionId("session-new");
      setActiveSessionTitle("New Satellite Query");
    }
  }

  return (
    <header className="flex h-12 sm:h-14 w-full items-center justify-between bg-[#000000] px-4 sm:px-6 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Expand Button when sidebar is collapsed */}
        {!isOpenDesktop && (
          <button
            onClick={onToggleDesktop}
            className="hidden md:flex p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open Sidebar (⌘B)"
            title="Open Sidebar (⌘B)"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="3.5" />
              <line x1="8.5" y1="3" x2="8.5" y2="21" />
              <path d="m11.5 9.5 2.5 2.5-2.5 2.5" />
            </svg>
          </button>
        )}

        {/* Title / Model selector */}
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md select-none font-sans">
            {activeSessionTitle || "SatQuery AI"}
          </h1>
          {isTemporaryChat && (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="relative flex items-center gap-2 text-xs font-sans">
        {/* Temporary Toggle Button */}
        <button
          onClick={handleToggleTemporary}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors border ${
            isTemporaryChat
              ? "border-amber-500/30 bg-amber-500/10 text-amber-300 font-medium shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
          }`}
          title={isTemporaryChat ? "Temporary chat enabled (will discard when switching)" : "Enable temporary chat"}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              isTemporaryChat ? "bg-amber-400 shadow-[0_0_6px_#f59e0b]" : "bg-neutral-500"
            }`}
          />
          <span>Temporary</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors text-xs font-medium"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>

        {/* More Options Menu */}
        <div className="relative">
          <button
            onClick={() => setOptionsOpen(!optionsOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {optionsOpen && (
            <div className="absolute right-0 top-10 z-40 w-56 rounded-2xl border border-white/15 bg-[#181818] p-1.5 shadow-2xl animate-fade-in font-sans text-xs text-neutral-300">
              <button
                onClick={() => {
                  setMapModalOpen(true);
                  setOptionsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors text-left"
              >
                <Globe className="h-4 w-4 text-neutral-400" />
                <span>Inspect AOI Satellite Map</span>
              </button>

              {lastResult?.execution_id && (
                <>
                  <div className="border-t border-white/10 my-1" />
                  <a
                    href={reportGeoJsonUrl(lastResult.execution_id)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOptionsOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                  >
                    <FileJson className="h-4 w-4 text-neutral-400" />
                    <span>Download GeoJSON</span>
                  </a>
                  <a
                    href={reportPdfUrl(lastResult.execution_id)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOptionsOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                  >
                    <Download className="h-4 w-4 text-neutral-400" />
                    <span>Download PDF Dossier</span>
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

