"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Edit2,
  Globe,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export interface ConversationSummaryItem {
  id: string;
  title: string;
  category: "Today" | "Yesterday" | "Previous 7 Days" | "Older";
}

interface ChatSidebarProps {
  conversations: ConversationSummaryItem[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  isOpenMobile = false,
  onCloseMobile,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: ("Today" | "Yesterday" | "Previous 7 Days" | "Older")[] = [
    "Today",
    "Yesterday",
    "Previous 7 Days",
    "Older",
  ];

  function startEditing(c: ConversationSummaryItem) {
    setEditingId(c.id);
    setEditTitle(c.title);
    setMenuOpenId(null);
  }

  function handleSaveRename(id: string) {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#0a0a0a] transition-transform duration-300 md:static md:translate-x-0 ${
        isOpenMobile ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Top Header / Brand + New Chat */}
      <div className="p-3.5 space-y-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono font-semibold tracking-wider text-white"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded border border-white/20 bg-white/5 text-[10px]">
              SQ
            </div>
            <span>SATQUERY AI</span>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 text-neutral-400 hover:text-white"
              aria-label="Close Sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-neutral-300 group-hover:text-white" />
            <span>New Analysis</span>
          </div>
          <kbd className="font-mono text-[10px] text-neutral-400">⌘K</kbd>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full rounded-lg border border-white/10 bg-[#121212] pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* History Stream Grouped by Date */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 text-xs">
        {categories.map((cat) => {
          const items = filtered.filter((c) => c.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              <div className="px-2 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                {cat}
              </div>

              {items.map((c) => {
                const isActive = activeId === c.id;
                const isEditing = editingId === c.id;

                if (isEditing) {
                  return (
                    <div key={c.id} className="p-1">
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(c.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full rounded bg-neutral-800 px-2 py-1 text-xs text-white border border-white/30 focus:outline-none"
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={c.id}
                    className={`group relative flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                    }`}
                    onClick={() => {
                      onSelectConversation(c.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-neutral-400 group-hover:text-neutral-300" />
                      <span className="truncate">{c.title}</span>
                    </div>

                    {/* Options Menu Trigger */}
                    <div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                        className="p-1 text-neutral-400 hover:text-white"
                        aria-label="Conversation Options"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>

                      {menuOpenId === c.id && (
                        <div className="absolute right-2 top-8 z-30 w-32 rounded-lg border border-white/15 bg-[#161616] p-1 shadow-xl animate-fade-in font-mono text-[11px]">
                          <button
                            onClick={() => startEditing(c)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              onDeleteConversation(c.id);
                              setMenuOpenId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom User Profile */}
      <div className="relative border-t border-white/10 p-3 bg-[#0d0d0d]">
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex w-full items-center justify-between rounded-lg p-1.5 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 font-mono text-xs font-semibold text-white">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Shivam</span>
              <span className="font-mono text-[10px] text-neutral-400">Research Workspace</span>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-neutral-400" />
        </button>

        {/* Profile popover menu */}
        {profileMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 rounded-xl border border-white/15 bg-[#141414] p-1.5 shadow-2xl animate-fade-in font-mono text-xs text-neutral-300 space-y-0.5">
            <Link
              href="/models"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Model Registry</span>
            </Link>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-neutral-400 cursor-not-allowed">
              <Settings className="h-3.5 w-3.5" />
              <span>Settings (Dark Mode)</span>
            </div>
            <div className="border-t border-white/5 my-1" />
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit to Website</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
