"use client";

import React, { useState, useRef, useEffect } from "react";
import { Settings, Globe, Shield, LogOut, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-[#171717] border border-[#303030] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-2 border-b border-[#262626] mb-1">
            <p className="text-xs font-medium text-white">Shivam (Analyst)</p>
            <p className="text-[11px] text-[#737373] truncate">shivam@earthobs.internal</p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#d4d4d4] hover:text-white hover:bg-[#262626] rounded-lg transition-colors text-left"
          >
            <Settings className="w-3.5 h-3.5 text-[#888888]" />
            Preferences & CRS Units
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#d4d4d4] hover:text-white hover:bg-[#262626] rounded-lg transition-colors text-left"
          >
            <Globe className="w-3.5 h-3.5 text-[#888888]" />
            STAC Data Catalog Connect
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#d4d4d4] hover:text-white hover:bg-[#262626] rounded-lg transition-colors text-left"
          >
            <Shield className="w-3.5 h-3.5 text-[#888888]" />
            Privacy & Ephemeral Logs
          </button>

          <div className="h-[1px] bg-[#262626] my-1" />

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#e57373] hover:text-[#ff8a80] hover:bg-[#262626] rounded-lg transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log out
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left",
          isOpen ? "bg-[#212121]" : "hover:bg-[#171717]"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-[#262626] border border-[#333333] flex items-center justify-center text-xs font-semibold text-white">
          S
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">Shivam</p>
          <p className="text-[11px] text-[#737373] truncate">Research Workspace</p>
        </div>
        <ChevronUp className={cn("w-4 h-4 text-[#737373] transition-transform", isOpen && "rotate-180")} />
      </button>
    </div>
  );
}
