"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatSidebar, type ConversationSummaryItem } from "@/components/chat/ChatSidebar";
import { SatelliteMapModal } from "@/components/chat/SatelliteMapModal";
import { ShareModal } from "@/components/chat/ShareModal";
import { EvidenceModal } from "@/components/chat/EvidenceModal";
import { listSessions } from "@/lib/api";
import { MOCK_SESSIONS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = Array.isArray(params?.id) ? params.id[0] : params?.id;

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

  useEffect(() => {
    if (chatId) {
      setSessionId(chatId);
    }
  }, [chatId, setSessionId]);

  useEffect(() => {
    listSessions()
      .then((sessions) => {
        if (sessions && sessions.length > 0) {
          const mapped: ConversationSummaryItem[] = sessions.map((s) => ({
            id: s.id,
            title: s.title || "Untitled Analysis",
            category: "Today",
          }));
          const combined = [
            ...mapped,
            ...MOCK_SESSIONS.filter((m) => !mapped.some((s) => s.id === m.id)),
          ];
          setConversations(combined);
        }
      })
      .catch(() => {});
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
    <div className="chat-workspace flex h-screen w-screen overflow-hidden bg-[#080808] text-neutral-100 font-sans selection:bg-white selection:text-black">
      <style>{`
        .chat-workspace ::-webkit-scrollbar,
        .chat-workspace::-webkit-scrollbar,
        .chat-workspace *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .chat-workspace ::-webkit-scrollbar-thumb,
        .chat-workspace::-webkit-scrollbar-thumb,
        .chat-workspace *::-webkit-scrollbar-thumb {
          background: transparent !important;
          display: none !important;
        }
        .chat-workspace,
        .chat-workspace * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
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

      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        <ChatHeader onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        <ChatArea initialSessionId={chatId} />
      </div>

      <ShareModal />
      <SatelliteMapModal />
      <EvidenceModal />
    </div>
  );
}
