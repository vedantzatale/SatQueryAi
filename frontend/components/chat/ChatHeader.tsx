"use client";

import { useState } from "react";
import {
  Cpu,
  Download,
  FileJson,
  Globe,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Share2,
  ShieldAlert,
} from "lucide-react";
import { reportGeoJsonUrl, reportPdfUrl } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  onToggleMobileSidebar: () => void;
  isOpenDesktop?: boolean;
  onToggleDesktop?: () => void;
  activeTask?: string;
}

export function ChatHeader({
  onToggleMobileSidebar,
  isOpenDesktop = true,
  onToggleDesktop,
  activeTask,
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
      setActiveSessionTitle("Temporary Analysis");
    } else {
      resetConversationState();
      setIsTemporaryChat(false);
      setSessionId("session-new");
      setActiveSessionTitle("New Satellite Query");
    }
  }

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[#1f1f1f] bg-[#000000]/80 backdrop-blur-md px-4 sm:px-6 sticky top-0 z-30 select-none">
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-[#737373] hover:text-white rounded-lg hover:bg-[#1a1a1a]"
          aria-label="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Expand Button when sidebar is collapsed */}
        {!isOpenDesktop && onToggleDesktop && (
          <button
            type="button"
            onClick={onToggleDesktop}
            className="hidden md:flex p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors shrink-0"
            aria-label="Open Sidebar (⌘B)"
            title="Open Sidebar (⌘B)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Title & Task Tag */}
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-xs sm:text-sm font-medium text-white truncate font-sans">
            {activeSessionTitle || "New Satellite Query"}
          </h1>

          {activeTask && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#171717] border border-[#2a2a2a] text-[#a3a3a3]">
              {activeTask}
            </span>
          )}

          {isTemporaryChat && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-[#221f14] border border-[#443818] text-[#d4b152] font-medium">
              <ShieldAlert className="w-3 h-3" />
              Temporary
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="relative flex items-center gap-2 text-xs font-sans">
        {/* Model Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121212] border border-[#262626] text-[11px] text-[#888888] font-mono shadow-subtle">
          <Cpu className="w-3.5 h-3.5 text-[#888888]" />
          <span>GeoChat • Sentinel Core</span>
        </div>

        {/* Temporary Toggle Button */}
        <button
          type="button"
          onClick={handleToggleTemporary}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all font-medium border",
            isTemporaryChat
              ? "bg-[#262626] text-white border-[#444444] shadow-subtle"
              : "bg-transparent text-[#737373] hover:text-white border-transparent hover:bg-[#171717]"
          )}
          title={isTemporaryChat ? "Temporary chat enabled (will discard when switching)" : "Enable temporary chat"}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              isTemporaryChat ? "bg-white" : "bg-[#525252]"
            )}
          />
          <span className="hidden sm:inline">Temporary</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#212121] text-[#e5e5e5] hover:text-white border border-[#2e2e2e] rounded-xl text-xs font-medium transition-colors shadow-subtle"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* More Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOptionsOpen(!optionsOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {optionsOpen && (
            <div className="absolute right-0 top-10 z-40 w-56 rounded-2xl border border-[#303030] bg-[#171717] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans text-xs text-neutral-300">
              <button
                type="button"
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
