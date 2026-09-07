"use client";

import Image from "next/image";
import { Attachment } from "@/lib/types";

interface EmptyStateProps {
  onSelectPrompt?: (prompt: string, sampleAttachments?: Attachment[]) => void;
}

export function EmptyState({}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-16 sm:py-20 px-4 text-center space-y-4 select-none animate-in fade-in duration-200">
      <div className="space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#141414] border border-[#2e2e2e] shadow-subtle mb-1">
          <Image
            src="/logo/satquertlogo.png"
            alt="SatQuery AI"
            width={28}
            height={28}
            className="h-7 w-7 rounded-[4px] object-contain shrink-0"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-white">
          SATQUERY AI
        </h2>
        <p className="text-sm text-[#888888] font-normal max-w-md mx-auto leading-relaxed">
          Ask your Earth observation imagery anything. Upload scenes to quantify changes, fuse radar and optical bands, and generate evidence-grounded reports.
        </p>
      </div>
    </div>
  );
}
