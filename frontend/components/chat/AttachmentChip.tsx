"use client";

import React from "react";
import { Attachment } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { X, Maximize2 } from "lucide-react";

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const setEvidenceModalData = useAppStore((s) => s.setEvidenceModalData);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const handleOpen = () => {
    if (attachment.url) {
      setEvidenceModalData({
        title: attachment.name || "Satellite Acquisition",
        image: attachment.url,
        metrics: [
          { label: "Sensor", value: attachment.sensor || "Sentinel-2" },
          ...(attachment.resolution ? [{ label: "Resolution", value: attachment.resolution }] : []),
          ...(attachment.size ? [{ label: "File Size", value: attachment.size }] : []),
        ],
      });
    }
  };

  return (
    <div
      onClick={handleOpen}
      role={attachment.url ? "button" : undefined}
      tabIndex={attachment.url ? 0 : undefined}
      title={attachment.url ? "Click to view full-resolution image" : undefined}
      className={`group flex items-center gap-2 p-1.5 pr-2 rounded-xl text-xs animate-in zoom-in-95 duration-100 cursor-pointer select-none transition-all border ${
        isLight
          ? "bg-[#fcfbf8] border-black/10 hover:border-black/20 hover:bg-white text-neutral-900 shadow-sm"
          : "bg-[#171717] border-[#2e2e2e] hover:border-white/40 hover:bg-[#202020] shadow-subtle"
      }`}
    >
      <div
        className={`relative w-8 h-8 rounded-lg overflow-hidden shrink-0 transition-colors border ${
          isLight
            ? "bg-[#ece7de] border-black/10"
            : "bg-[#0d0d0d] border-[#333333] group-hover:border-white/40"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full h-full object-cover transition-transform duration-150 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Maximize2 className="w-3 h-3 text-white" />
        </div>
      </div>

      <div className="min-w-0 pr-1">
        <p
          className={`font-medium truncate max-w-[140px] text-[11px] transition-colors ${
            isLight
              ? "text-neutral-900 group-hover:text-black"
              : "text-white group-hover:text-white"
          }`}
        >
          {attachment.name}
        </p>
        <p
          className={`text-[10px] font-mono truncate transition-colors ${
            isLight
              ? "text-neutral-500 group-hover:text-neutral-700"
              : "text-[#888888] group-hover:text-neutral-300"
          }`}
        >
          {attachment.sensor || "Satellite Scene"} {attachment.resolution && `• ${attachment.resolution}`}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(attachment.id);
        }}
        className={`p-1 rounded-md transition-colors ml-auto ${
          isLight
            ? "text-neutral-400 hover:text-black hover:bg-black/5"
            : "text-[#737373] hover:text-white hover:bg-[#262626]"
        }`}
        title="Remove attachment"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
