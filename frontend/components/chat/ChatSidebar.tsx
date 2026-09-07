"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  Globe,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { UI_LANGUAGES, useT } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

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
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { language, t } = useT();
  const setUiLanguage = useAppStore((s) => s.setUiLanguage);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories: ("Today" | "Yesterday" | "Previous 7 Days" | "Older")[] = [
    "Today",
    "Yesterday",
    "Previous 7 Days",
    "Older",
  ];

  const categoryLabels: Record<(typeof categories)[number], string> = {
    Today: t("sidebar.categoryToday"),
    Yesterday: t("sidebar.categoryYesterday"),
    "Previous 7 Days": t("sidebar.categoryPrevious7"),
    Older: t("sidebar.categoryOlder"),
  };

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

  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r ${
        isLight ? "border-black/10 bg-[#ede8df] text-[#18181b]" : "border-white/10 bg-[#000000] text-white"
      } overflow-hidden transition-[width,transform] duration-300 ease-[cubic-bezier(0.2,0,0,1)] md:static ${
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
              className={`flex items-center gap-2.5 text-xs font-bold tracking-wider uppercase ${isLight ? "text-neutral-900" : "text-white"}`}
            >
              <Image
                src="/logo/satquertlogo.png"
                alt="SatQuery AI"
                width={18}
                height={18}
                className="h-[18px] w-[18px] rounded-[4px] object-contain shrink-0"
              />
              <span>SATQUERY AI</span>
            </Link>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (onToggleDesktop) onToggleDesktop();
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`p-1.5 rounded-lg transition-colors duration-75 ${isLight ? "text-neutral-600 hover:text-black hover:bg-black/5" : "text-neutral-400 hover:text-white hover:bg-white/10"}`}
                aria-label="Toggle Sidebar (⌘B)"
                title="Toggle Sidebar (⌘B)"
              >
                <SidebarCollapseIcon className="h-4 w-4" />
              </button>
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className={`md:hidden p-1.5 ${isLight ? "text-neutral-600 hover:text-black" : "text-neutral-400 hover:text-white"}`}
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
            className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-colors duration-75 group ${
              isLight
                ? "border-black/10 bg-[#fcfbf8] text-neutral-900 hover:bg-white hover:border-black/20 shadow-sm"
                : "border-white/10 bg-[#141414] text-white hover:bg-[#202020] hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-2">
              <Plus className={`h-4 w-4 ${isLight ? "text-neutral-700 group-hover:text-black" : "text-neutral-300 group-hover:text-white"}`} />
              <span>{t("sidebar.newAnalysis")}</span>
            </div>
            <kbd className={`font-mono text-[10px] rounded px-1.5 py-0.5 border ${
              isLight ? "bg-black/5 border-black/10 text-neutral-600" : "bg-white/5 border-white/10 text-neutral-400"
            }`}>⌘N</kbd>
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("sidebar.searchPlaceholder")}
              className={`w-full rounded-xl border pl-9 pr-3.5 py-2 text-xs font-sans focus:outline-none ${
                isLight
                  ? "border-black/10 bg-[#fcfbf8] text-neutral-900 placeholder:text-neutral-500 focus:border-black/30 shadow-sm"
                  : "border-white/10 bg-[#141414] text-white placeholder-neutral-500 focus:border-white/30"
              }`}
            />
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2 text-xs transition-colors ${
                isLight
                  ? "border-black/10 bg-[#fcfbf8] text-neutral-800 hover:border-black/20 shadow-sm"
                  : "border-white/10 bg-[#141414] text-neutral-300 hover:border-white/30 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                {UI_LANGUAGES.find((l) => l.code === language)?.label}
              </span>
            </button>
            {langMenuOpen && (
              <div className={`absolute left-0 right-0 top-10 z-30 rounded-xl border p-1 animate-fade-in text-xs ${
                isLight
                  ? "border-black/10 bg-[#fcfbf8] text-neutral-800 shadow-xl"
                  : "border-white/15 bg-[#181818] shadow-2xl"
              }`}>
                {UI_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setUiLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 ${
                      isLight
                        ? "text-neutral-700 hover:bg-black/5 hover:text-black"
                        : "text-neutral-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>{l.label}</span>
                    {l.code === language && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History Stream Grouped by Date */}
        <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-2.5 py-2 space-y-5 text-xs font-sans">
          {categories.map((cat) => {
            const items = filtered.filter((c) => c.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-1">
                <div className="px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-neutral-500 select-none">
                  {categoryLabels[cat]}
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
                          className={`w-full rounded-lg px-3 py-2 text-xs border focus:outline-none ${
                            isLight
                              ? "bg-[#fcfbf8] text-neutral-900 border-black/20 focus:border-black/40"
                              : "bg-[#212121] text-white border-white/30 focus:border-white/50"
                          }`}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={c.id}
                      className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors duration-75 cursor-pointer select-none ${
                        isActive
                          ? isLight
                            ? "bg-[#fcfbf8] text-neutral-950 font-medium border border-black/10 shadow-sm"
                            : "bg-[#212121] text-white font-medium"
                          : isLight
                            ? "text-neutral-700 hover:bg-black/5 hover:text-neutral-950"
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
                            isActive
                              ? isLight ? "text-neutral-950" : "text-white"
                              : isLight ? "text-neutral-500 group-hover:text-neutral-900" : "text-neutral-400 group-hover:text-neutral-200"
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
                            ? isLight ? "opacity-100 text-neutral-600" : "opacity-100 text-neutral-300"
                            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-neutral-400"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                          className={`p-1 rounded ${isLight ? "text-neutral-500 hover:text-black hover:bg-black/5" : "text-neutral-400 hover:text-white hover:bg-white/10"}`}
                          aria-label="Conversation Options"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {menuOpenId === c.id && (
                          <div className={`absolute right-2 top-9 z-30 w-32 rounded-xl border p-1 shadow-2xl font-sans text-xs ${
                            isLight ? "border-black/10 bg-[#fcfbf8] text-neutral-800 shadow-xl" : "border-white/15 bg-[#181818]"
                          }`}>
                            <button
                              onClick={() => startEditing(c)}
                              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 ${
                                isLight ? "text-neutral-700 hover:bg-black/5 hover:text-black" : "text-neutral-300 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <Edit2 className="h-3 w-3" />
                              <span>{t("sidebar.rename")}</span>
                            </button>
                            <button
                              onClick={() => {
                                onDeleteConversation(c.id);
                                setMenuOpenId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>{t("sidebar.delete")}</span>
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
        <div className={`relative border-t p-3 ${isLight ? "border-black/10 bg-transparent" : "border-white/10 bg-[#080808]"}`}>
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className={`flex w-full items-center justify-between rounded-xl p-2 transition-colors text-left ${
              profileMenuOpen
                ? isLight ? "bg-black/10" : "bg-[#181818]"
                : isLight ? "hover:bg-black/5" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold user-avatar-badge select-none ${
                  isLight ? "bg-[#18181b] text-white shadow-xs" : "bg-neutral-800 text-white"
                }`}
                style={isLight ? { color: "#ffffff", backgroundColor: "#18181b" } : undefined}
              >
                S
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-xs font-semibold leading-tight truncate ${isLight ? "text-neutral-900" : "text-white"}`}>Shivam</span>
                <span className={`text-[10px] font-normal leading-tight truncate ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>{t("sidebar.researchWorkspace")}</span>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-150 ${profileMenuOpen ? "rotate-180" : ""} ${isLight ? "text-neutral-500" : "text-neutral-400"}`} />
          </button>

          {/* Profile popover menu */}
          {profileMenuOpen && (
            <div className={`absolute bottom-16 left-3 right-3 rounded-2xl border p-3 shadow-2xl animate-fade-in font-sans text-xs ${
              isLight ? "border-black/10 bg-[#fcfbf8] text-neutral-800 shadow-xl" : "border-white/10 bg-[#141414] text-neutral-300"
            }`}>
              {/* User Details */}
              <div className="px-1.5 py-1">
                <div className={`text-xs font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>Shivam (Analyst)</div>
                <div className={`text-[11px] mt-0.5 ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>shivam@earthobs.internal</div>
              </div>

              <div className={`my-2 border-t ${isLight ? "border-black/10" : "border-white/10"}`} />

              {/* Menu Items */}
              <div className="space-y-0.5">
                <button
                  onClick={() => setProfileMenuOpen(false)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors text-left ${
                    isLight ? "text-neutral-700 hover:bg-black/5 hover:text-neutral-950" : "text-neutral-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Settings className={`h-4 w-4 ${isLight ? "text-neutral-500" : "text-neutral-400"}`} />
                  <span>{t("sidebar.preferences")}</span>
                </button>

                <Link
                  href="/models"
                  onClick={() => setProfileMenuOpen(false)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors text-left ${
                    isLight ? "text-neutral-700 hover:bg-black/5 hover:text-neutral-950" : "text-neutral-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Globe className={`h-4 w-4 ${isLight ? "text-neutral-500" : "text-neutral-400"}`} />
                  <span>{t("sidebar.stacCatalog")}</span>
                </Link>

                <button
                  onClick={() => setProfileMenuOpen(false)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-colors text-left ${
                    isLight ? "text-neutral-700 hover:bg-black/5 hover:text-neutral-950" : "text-neutral-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Shield className={`h-4 w-4 ${isLight ? "text-neutral-500" : "text-neutral-400"}`} />
                  <span>{t("sidebar.privacy")}</span>
                </button>
              </div>

              <div className={`my-2 border-t ${isLight ? "border-black/10" : "border-white/10"}`} />

              {/* Logout */}
              <Link
                href="/"
                onClick={() => setProfileMenuOpen(false)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left ${
                  isLight ? "text-rose-600 hover:bg-rose-500/10" : "text-rose-400 hover:bg-rose-500/10"
                }`}
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>{t("sidebar.logout")}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
