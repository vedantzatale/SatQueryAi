"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onSelect: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export function ConversationItem({
  id,
  title,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim() && onRename) {
      onRename(id, titleInput.trim());
    }
    setIsEditing(false);
    setMenuOpen(false);
  };

  const handleCancelRename = () => {
    setTitleInput(title);
    setIsEditing(false);
    setMenuOpen(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer select-none",
        isActive
          ? "bg-[#212121] text-white font-medium shadow-subtle"
          : "text-[#a3a3a3] hover:text-[#e5e5e5] hover:bg-[#171717]"
      )}
      onClick={() => {
        if (!isEditing) {
          onSelect(id);
        }
      }}
    >
      <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />

      {isEditing ? (
        <form
          onSubmit={handleSaveRename}
          className="flex-1 flex items-center gap-1 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="w-full bg-[#121212] border border-[#333333] rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-[#888888]"
          />
          <button
            type="submit"
            className="p-1 hover:text-white text-[#a3a3a3]"
            title="Save"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="p-1 hover:text-white text-[#a3a3a3]"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <span className="flex-1 truncate text-xs sm:text-sm">
          {title}
        </span>
      )}

      {!isEditing && (onRename || onDelete) && (
        <div
          ref={menuRef}
          className="relative shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className={cn(
              "p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[#303030] text-[#a3a3a3] hover:text-white transition-opacity",
              menuOpen && "opacity-100 bg-[#303030] text-white"
            )}
            title="Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-[#171717] border border-[#303030] rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              {onRename && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#d4d4d4] hover:text-white hover:bg-[#262626] transition-colors text-left"
                >
                  <Pencil className="w-3 h-3" />
                  Rename
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#e57373] hover:text-[#ff8a80] hover:bg-[#262626] transition-colors text-left"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
