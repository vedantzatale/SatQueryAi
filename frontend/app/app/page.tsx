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
  const setActiveSessionTitle = useAppStore((s) => s.setActiveSessionTitle);
  const resetConversationState = useAppStore((s) => s.resetConversationState);


  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<ConversationSummaryItem[]>(
    MOCK_SESSIONS.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
    }))
  );

  // Global keyboard shortcuts (Cmd+B to toggle sidebar, Cmd+N for new chat)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setDesktopSidebarOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        resetConversationState();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetConversationState]);

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
    const found = conversations.find((c) => c.id === id);
    if (found) {
      setActiveSessionTitle(found.title);
    }
    setMobileSidebarOpen(false);
  }

  function handleNewChat() {
    // If the top session is already an empty/untouched "New Satellite Query", reuse it
    if (conversations.length > 0 && conversations[0].title === "New Satellite Query" && sessionId === conversations[0].id) {
      resetConversationState();
      setActiveSessionTitle("New Satellite Query");
      setMobileSidebarOpen(false);
      return;
    }

    const newId = `session-${Date.now()}`;
    const newTitle = "New Satellite Query";
    resetConversationState();
    setSessionId(newId);
    setActiveSessionTitle(newTitle);
    setConversations((prev) => [
      { id: newId, title: newTitle, category: "Today" },
      ...prev.filter((c) => c.id !== "session-new" && !(c.title === "New Satellite Query" && c.id.startsWith("session-"))),
    ]);
    setMobileSidebarOpen(false);
  }

  function handleDeleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (sessionId === id) {
      handleNewChat();
    }
  }

  function handleRenameConversation(id: string, newTitle: string) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
    if (sessionId === id) {
      setActiveSessionTitle(newTitle);
    }
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
        isOpenDesktop={desktopSidebarOpen}
        onToggleDesktop={() => setDesktopSidebarOpen((prev) => !prev)}
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
        <ChatHeader
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          isOpenDesktop={desktopSidebarOpen}
          onToggleDesktop={() => setDesktopSidebarOpen((prev) => !prev)}
        />
        <ChatArea />
      </div>

      {/* Global Modals */}
      <ShareModal />
      <SatelliteMapModal />
    </div>
  );
}

