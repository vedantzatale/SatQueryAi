"use client";

import { useEffect, useState } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar, type ConversationSummaryItem } from "@/components/chat/ChatSidebar";
import { SatelliteMapModal } from "@/components/chat/SatelliteMapModal";
import { ShareModal } from "@/components/chat/ShareModal";
import { listSessions } from "@/lib/api";
import { MOCK_SESSIONS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

export default function WorkspacePage() {
  const sessionId = useAppStore((s) => s.sessionId);
  const setSessionId = useAppStore((s) => s.setSessionId);
  const resetConversationState = useAppStore((s) => s.resetConversationState);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummaryItem[]>(
    MOCK_SESSIONS.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
    }))
  );

  // Sync with real backend sessions on load if available
  useEffect(() => {
    listSessions()
      .then((sessions) => {
        if (sessions && sessions.length > 0) {
          const mapped: ConversationSummaryItem[] = sessions.map((s) => ({
            id: s.id,
            title: s.title || "Untitled Analysis",
            category: "Today",
          }));
          // Merge with mock sessions avoiding duplicate ids
          const combined = [
            ...mapped,
            ...MOCK_SESSIONS.filter((m) => !mapped.some((s) => s.id === m.id)),
          ];
          setConversations(combined);
        }
      })
      .catch(() => {
        // Use default mock sessions when offline
      });
  }, []);

  function handleSelectConversation(id: string) {
    setSessionId(id);
    setMobileSidebarOpen(false);
  }

  function handleNewChat() {
    resetConversationState();
    setMobileSidebarOpen(false);
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (sessionId === id) {
      resetConversationState();
    }
  }

  function handleRenameConversation(id: string, newTitle: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] text-neutral-100 font-sans selection:bg-white selection:text-black">
      {/* Sidebar (Desktop + Mobile Drawer) */}

      <ChatSidebar
        conversations={conversations}
        activeId={sessionId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Backdrop for Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Main Chat Workspace */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        <ChatHeader onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <ChatArea />
      </div>

      {/* Global Modals */}
      <ShareModal />
      <SatelliteMapModal />
    </div>
  );
}
