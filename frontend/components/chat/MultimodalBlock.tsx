"use client";

import React, { useState } from "react";
import { MultimodalData } from "@/lib/types";
import { Cloud, Radio, Sparkles, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface MultimodalBlockProps {
  data: MultimodalData;
  onOpenViewer?: (title: string, image: string) => void;
}

export function MultimodalBlock({ data, onOpenViewer }: MultimodalBlockProps) {
  const [activeTab, setActiveTab] = useState<"fused" | "sar" | "optical">("fused");
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div className={`w-full rounded-2xl border overflow-hidden space-y-4 p-4 ${
      isLight ? "border-black/10 bg-[#fcfbf8] shadow-sm" : "border-[#262626] bg-[#0f0f0f] shadow-card"
    }`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b ${
        isLight ? "border-black/10" : "border-[#1f1f1f]"
      }`}>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isLight ? "text-neutral-600" : "text-[#888888]"}`} />
            <h4 className={`text-xs font-semibold uppercase tracking-wider font-mono ${
              isLight ? "text-neutral-900" : "text-white"
            }`}>
              Multimodal Cross-Sensor Fusion
            </h4>
          </div>
          <p className={`text-[11px] ${isLight ? "text-neutral-600" : "text-[#737373]"}`}>
            Active radar (SAR) combined with optical baseline
          </p>
        </div>

        {/* Tab switch */}
        <div className={`inline-flex p-0.5 rounded-lg border text-xs self-start sm:self-auto ${
          isLight ? "bg-[#ede8df] border-black/10" : "bg-[#141414] border-[#212121]"
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab("fused")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "fused"
                ? isLight
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "bg-[#262626] text-white"
                : isLight
                  ? "text-neutral-600 hover:text-neutral-950"
                  : "text-[#737373] hover:text-white"
            )}
          >
            <Sparkles className={`w-3 h-3 ${isLight ? "text-neutral-600" : "text-[#888888]"}`} />
            Fused Output
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "sar"
                ? isLight
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "bg-[#262626] text-white"
                : isLight
                  ? "text-neutral-600 hover:text-neutral-950"
                  : "text-[#737373] hover:text-white"
            )}
          >
            <Radio className={`w-3 h-3 ${isLight ? "text-neutral-600" : "text-[#888888]"}`} />
            SAR (Radar)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("optical")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "optical"
                ? isLight
                  ? "bg-white text-neutral-950 shadow-xs"
                  : "bg-[#262626] text-white"
                : isLight
                  ? "text-neutral-600 hover:text-neutral-950"
                  : "text-[#737373] hover:text-white"
            )}
          >
            <Cloud className={`w-3 h-3 ${isLight ? "text-neutral-600" : "text-[#888888]"}`} />
            Optical (Cloudy)
          </button>
        </div>
      </div>

      {/* Visual Canvas */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#050505] rounded-xl overflow-hidden border border-[#212121]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            activeTab === "fused"
              ? data.fusedImage
              : activeTab === "sar"
              ? data.sarImage
              : data.opticalImage
          }
          alt={activeTab}
          className="w-full h-full object-cover"
        />

        {/* Dynamic Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/85 border border-white/20 text-[10px] font-mono text-white flex items-center gap-1.5">
          {activeTab === "fused" ? (
            <>
              <Sparkles className="w-3 h-3 text-white" />
              <span>TERRAMIND FUSED REPRESENTATION • 410 ha FLOODING</span>
            </>
          ) : activeTab === "sar" ? (
            <>
              <Radio className="w-3 h-3 text-white" />
              <span>SENTINEL-1 C-BAND SAR • 100% CLOUD PENETRATION</span>
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3 text-white" />
              <span>SENTINEL-2 OPTICAL • 88.4% CLOUD OBSCURATION</span>
            </>
          )}
        </div>

        {onOpenViewer && (
          <button
            type="button"
            onClick={() =>
              onOpenViewer(
                activeTab === "fused"
                  ? "Fused Multimodal Analysis"
                  : activeTab === "sar"
                  ? "SAR Backscatter Radar Layer"
                  : "Optical Cloud Covered Acquisition",
                activeTab === "fused"
                  ? data.fusedImage
                  : activeTab === "sar"
                  ? data.sarImage
                  : data.opticalImage
              )
            }
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 border border-white/20 text-[#d4d4d4] hover:text-white transition-colors"
            title="Expand View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Insights Row */}
      <div className={`p-3 rounded-xl text-xs space-y-1 font-mono border ${
        isLight ? "bg-[#ede8df] border-black/10" : "bg-[#141414] border-[#212121]"
      }`}>
        <span className={`text-[10px] uppercase tracking-wide block ${
          isLight ? "text-neutral-600" : "text-[#737373]"
        }`}>
          Sensor Evaluation
        </span>
        <p className={`leading-relaxed ${isLight ? "text-neutral-800" : "text-[#d4d4d4]"}`}>
          {activeTab === "fused"
            ? data.fusedInsight
            : activeTab === "sar"
            ? data.sarInsight
            : data.opticalInsight}
        </p>
      </div>
    </div>
  );
}
