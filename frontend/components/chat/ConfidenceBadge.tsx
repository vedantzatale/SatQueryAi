"use client";

import React from "react";
import { BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  tier?: "High" | "Moderate" | "Calculated" | string;
  className?: string;
}

export function ConfidenceBadge({ confidence, tier = "High", className }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#141414] border border-[#2a2a2a] text-xs select-none",
        className
      )}
    >
      <div className="flex items-center gap-1.5 text-[#888888]">
        <BarChart2 className="w-3.5 h-3.5 text-[#aaaaaa]" />
        <span className="font-mono text-[11px] text-[#737373] uppercase tracking-wide">Confidence</span>
      </div>
      <div className="h-3 w-[1px] bg-[#2e2e2e]" />
      <div className="flex items-center gap-1">
        <span className="font-semibold text-white font-mono">{percentage}%</span>
        <span className="text-[10px] text-[#888888]">({tier})</span>
      </div>
    </div>
  );
}
