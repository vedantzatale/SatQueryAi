"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronUp,
  Compass,
  Edit2,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react";

export interface ConversationSummaryItem {
  id: string;
  title: string;
  category: "Today" | "Yesterday" | "Previous 7 Days" | "Older";
}

export function SidebarCollapseIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="3.5" />
      <line x1="8.5" y1="3" x2="8.5" y2="21" />
      <path d="m14 9.5-2.5 2.5 2.5 2.5" />
    </svg>
  );
}

interface ChatSidebarProps {
  conversations: ConversationSummaryItem[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  isOpenDesktop?: boolean;
  onToggleDesktop?: () => void;
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
  isOpenDesktop = true,
  onToggleDesktop,
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

  // Suppresses the onBlur save that a browser can still fire when Escape
  // unmounts the focused rename <input> -- without this, cancelling with
  // Escape could still persist the edit the user was trying to discard.
  const skipBlurSaveRef = useRef(false);

  function handleSaveRename(id: string) {
    if (skipBlurSaveRef.current) {
      skipBlurSaveRef.current = false;
      return;
    }
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  }

  function cancelEditing() {
    skipBlurSaveRef.current = true;
    setEditingId(null);
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#000000] transition-all duration-300 md:static ${
        isOpenMobile ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
      } ${
        isOpenDesktop
          ? "md:w-72 md:opacity-100 md:pointer-events-auto"
          : "md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0 md:overflow-hidden"
      }`}
    >
      {/* Top Header / Brand + New Chat */}
      <div className="p-3.5 space-y-3 min-w-[288px]">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xs font-bold tracking-widest text-white uppercase"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_4px_white]" />
            </div>
            <span>SATQUERY AI</span>
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (onToggleDesktop) onToggleDesktop();
                if (onCloseMobile) onCloseMobile();
              }}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/5 transition-colors"
              aria-label="Toggle Sidebar (⌘B)"
              title="Toggle Sidebar (⌘B)"
            >
              <SidebarCollapseIcon className="h-4 w-4" />
            </button>
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
        </div>


        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white hover:bg-white/[0.08] hover:border-white/25 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-neutral-300 group-hover:text-white" />
            <span>New Analysis</span>
          </div>
          <span className="font-mono text-[10px] text-neutral-500 rounded bg-white/5 px-1.5 py-0.5 border border-white/5">⌘N</span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-lg border border-white/10 bg-[#111111] pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none font-sans"
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
                          if (e.key === "Escape") cancelEditing();
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
      <div className="relative border-t border-white/10 p-3 bg-[#080808]">
        <button
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex w-full items-center justify-between rounded-lg p-1.5 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Shivam</span>
              <span className="text-[10px] text-neutral-500">Research Workspace</span>
            </div>
          </div>
          <ChevronUp className="h-4 w-4 text-neutral-500" />
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
