"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Compass,
  Edit2,
  Globe,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Shield,
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
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-[#000000] overflow-hidden transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] md:static ${
        isOpenMobile ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"
      } ${
        isOpenDesktop
          ? "md:w-72 md:opacity-100 md:pointer-events-auto"
          : "md:w-0 md:opacity-0 md:pointer-events-none md:border-r-0"
      }`}
    >
      <div className="w-72 h-full flex flex-col shrink-0">
        {/* Top Header / Brand + New Chat */}
        <div className="p-3 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-xs font-bold tracking-wider text-white uppercase"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_6px_white]" />
              </div>
              <span>SATQUERY AI</span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (onToggleDesktop) onToggleDesktop();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors duration-75"
                aria-label="Toggle Sidebar (⌘B)"
                title="Toggle Sidebar (⌘B)"
              >
                <SidebarCollapseIcon className="h-4 w-4" />
              </button>
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className="md:hidden p-1.5 text-neutral-400 hover:text-white"
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
            className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#141414] px-3.5 py-2.5 text-xs font-medium text-white hover:bg-[#202020] hover:border-white/20 transition-colors duration-75 group"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-neutral-300 group-hover:text-white" />
              <span>New Analysis</span>
            </div>
            <kbd className="font-mono text-[10px] text-neutral-400 rounded bg-white/5 border border-white/10 px-1.5 py-0.5">⌘N</kbd>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-white/10 bg-[#141414] pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:border-white/30 focus:outline-none font-sans"
            />
          </div>
        </div>

        {/* History Stream Grouped by Date */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-5 text-xs font-sans">
          {categories.map((cat) => {
            const items = filtered.filter((c) => c.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <div className="px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500 select-none">
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
                          className="w-full rounded-lg bg-[#212121] px-3 py-2 text-xs text-white border border-white/30 focus:outline-none"
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={c.id}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-75 cursor-pointer select-none ${
                        isActive
                          ? "bg-[#212121] text-white font-medium"
                          : "text-neutral-300 hover:bg-[#181818] hover:text-white"
                      }`}
                      onClick={() => {
                        onSelectConversation(c.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <svg
                          className={`h-4 w-4 shrink-0 ${
                            isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="truncate text-[13px] leading-tight font-normal">{c.title}</span>
                      </div>

                      {/* Options Menu Trigger */}
                      <div
                        className={`ml-1 shrink-0 ${
                          isActive
                            ? "opacity-100 text-neutral-300"
                            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-neutral-400"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                          aria-label="Conversation Options"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {menuOpenId === c.id && (
                          <div className="absolute right-2 top-9 z-30 w-32 rounded-xl border border-white/15 bg-[#181818] p-1 shadow-2xl font-sans text-xs">
                            <button
                              onClick={() => startEditing(c)}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>Rename</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteConversation(c.id);
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-red-400 hover:bg-red-500/10"
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
            className={`flex w-full items-center justify-between rounded-xl p-2 transition-colors text-left ${
              profileMenuOpen ? "bg-[#181818]" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
                S
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Shivam</span>
                <span className="text-[10px] text-neutral-400 font-normal">Research Workspace</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>

          {/* Profile popover menu */}
          {profileMenuOpen && (
            <div className="absolute bottom-16 left-3 right-3 rounded-2xl border border-white/10 bg-[#141414] p-3 shadow-2xl animate-fade-in font-sans text-xs text-neutral-300">
              {/* User Details */}
              <div className="px-1.5 py-1">
                <div className="text-xs font-semibold text-white">Shivam (Analyst)</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">shivam@earthobs.internal</div>
              </div>

              <div className="border-t border-white/10 my-2" />

              {/* Menu Items */}
              <div className="space-y-0.5">
                <button
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <Settings className="h-4 w-4 text-neutral-400" />
                  <span>Preferences & CRS Units</span>
                </button>

                <Link
                  href="/models"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <Globe className="h-4 w-4 text-neutral-400" />
                  <span>STAC Data Catalog Connect</span>
                </Link>

                <button
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-neutral-200 hover:bg-white/10 hover:text-white transition-colors text-left"
                >
                  <Shield className="h-4 w-4 text-neutral-400" />
                  <span>Privacy & Ephemeral Logs</span>
                </button>
              </div>

              <div className="border-t border-white/10 my-2" />

              {/* Logout */}
              <Link
                href="/"
                onClick={() => setProfileMenuOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4 text-rose-400" />
                <span>Log out</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
