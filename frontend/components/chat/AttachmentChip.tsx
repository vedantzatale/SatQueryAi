"use client";

import React from "react";
import { Attachment } from "@/lib/types";
import { X } from "lucide-react";

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-2 p-1.5 pr-2 bg-[#171717] border border-[#2e2e2e] rounded-xl shadow-subtle text-xs animate-in zoom-in-95 duration-100">
      <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0d0d0d] border border-[#333333] shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="min-w-0 pr-1">
        <p className="font-medium text-white truncate max-w-[140px] text-[11px]">
          {attachment.name}
        </p>
        <p className="text-[10px] text-[#888888] font-mono truncate">
          {attachment.sensor || "Satellite Scene"} {attachment.resolution && `• ${attachment.resolution}`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="p-1 rounded-md text-[#737373] hover:text-white hover:bg-[#262626] transition-colors"
        title="Remove attachment"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
