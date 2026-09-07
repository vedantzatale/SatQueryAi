"use client";

import React from "react";
import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface ConfidenceBadgeProps {
  confidence: number;
  tier?: "High" | "Moderate" | "Calculated" | string;
  className?: string;
}

export function ConfidenceBadge({ confidence, tier = "High", className }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs select-none border transition-colors",
        isLight
          ? "bg-[#ede8df] border-black/10 text-neutral-800 shadow-xs"
          : "bg-[#141414] border-[#2a2a2a]",
        className
      )}
    >
      <div className={`flex items-center gap-1.5 ${isLight ? "text-neutral-600" : "text-[#888888]"}`}>
        <BarChart2 className={`w-3.5 h-3.5 ${isLight ? "text-neutral-700" : "text-[#aaaaaa]"}`} />
        <span className={`font-mono text-[11px] uppercase tracking-wide ${isLight ? "text-neutral-600" : "text-[#737373]"}`}>Confidence</span>
      </div>
      <div className={`h-3 w-[1px] ${isLight ? "bg-black/15" : "bg-[#2e2e2e]"}`} />
      <div className="flex items-center gap-1">
        <span className={`font-semibold font-mono ${isLight ? "text-neutral-950" : "text-white"}`}>{percentage}%</span>
        <span className={`text-[10px] ${isLight ? "text-neutral-600" : "text-[#888888]"}`}>({tier})</span>
      </div>
    </div>
  );
}
