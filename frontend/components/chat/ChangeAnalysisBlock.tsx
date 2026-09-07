"use client";

import React, { useState } from "react";
import { ChangeAnalysisData } from "@/lib/types";
import { Layers, Calendar, ArrowRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChangeAnalysisBlockProps {
  data: ChangeAnalysisData;
  onOpenViewer?: (title: string, image: string) => void;
}

export function ChangeAnalysisBlock({ data, onOpenViewer }: ChangeAnalysisBlockProps) {
  const [activeTab, setActiveTab] = useState<"slider" | "before" | "after" | "mask">("slider");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  return (
    <div className="w-full rounded-2xl border border-[#262626] bg-[#0f0f0f] overflow-hidden space-y-4 p-4 shadow-card">
      {/* Header with Title & Date Comparison */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1f1f1f]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#888888]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Temporal Change Analysis
            </h4>
          </div>
          <p className="text-[11px] text-[#737373]">{data.summary}</p>
        </div>

        {/* Date comparison pill */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#171717] border border-[#262626] text-xs font-mono text-[#a3a3a3] shrink-0 self-start sm:self-auto">
          <Calendar className="w-3 h-3 text-[#737373]" />
          <span>{data.beforeDate}</span>
          <ArrowRight className="w-3 h-3 text-[#525252]" />
          <span className="text-white font-medium">{data.afterDate}</span>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex p-0.5 rounded-lg bg-[#141414] border border-[#212121] text-xs">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("slider")}
            className={cn(
              "px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "slider" ? "bg-[#262626] text-white" : "text-[#737373] hover:text-white"
            )}
          >
            Split Slider
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("before")}
            className={cn(
              "px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "before" ? "bg-[#262626] text-white" : "text-[#737373] hover:text-white"
            )}
          >
            Before ({data.beforeDate?.slice(-4) || "T1"})
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("after")}
            className={cn(
              "px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "after" ? "bg-[#262626] text-white" : "text-[#737373] hover:text-white"
            )}
          >
            After ({data.afterDate?.slice(-4) || "T2"})
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab("mask")}
            className={cn(
              "px-3 py-1 rounded-md transition-colors text-[11px] font-medium",
              activeTab === "mask" ? "bg-[#262626] text-white" : "text-[#737373] hover:text-white"
            )}
          >
            Change Mask
          </button>
        </div>

        {onOpenViewer && (
          <button
            type="button"
            onClick={() =>
              onOpenViewer(
                "Temporal Change Comparison",
                activeTab === "before"
                  ? data.beforeImage
                  : activeTab === "after"
                  ? data.afterImage
                  : data.changeMaskImage
              )
            }
            className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Interactive Visual Canvas */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#050505] rounded-xl overflow-hidden border border-[#212121] select-none">
        {activeTab === "slider" ? (
          <div
            className="relative w-full h-full cursor-ew-resize overflow-hidden"
            onMouseMove={handleSliderMove}
            onTouchMove={handleTouchMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* After Image (Full background) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.afterImage}
              alt="After acquisition"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Before Image (Clipped overlay) */}
            <div
              className="absolute inset-0 h-full overflow-hidden border-r border-white/80"
              style={{ width: `${sliderPosition}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.beforeImage}
                alt="Before acquisition"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: "100%", height: "100%" }}
              />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-white">
                BEFORE • {data.beforeDate}
              </div>
            </div>

            {/* After Label */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-white pointer-events-none">
              AFTER • {data.afterDate}
            </div>

            {/* Divider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize pointer-events-none flex items-center justify-center shadow-lg"
              style={{ left: `calc(${sliderPosition}% - 2px)` }}
            >
              <div className="w-6 h-6 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-md">
                ↔
              </div>
            </div>
          </div>
        ) : activeTab === "before" ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.beforeImage} alt="Before acquisition" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-white">
              BEFORE • {data.beforeDate}
            </div>
          </div>
        ) : activeTab === "after" ? (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.afterImage} alt="After acquisition" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-white">
              AFTER • {data.afterDate}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.changeMaskImage} alt="Segmented change mask" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/80 border border-white/20 text-[10px] font-mono text-white">
              DETECTED CHANGE MASK • {data.areaHa} ha
            </div>
          </div>
        )}
      </div>

      {/* Quantitative Change Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 bg-[#141414] border border-[#212121] rounded-xl space-y-0.5">
          <span className="text-[10px] uppercase font-mono text-[#737373]">Estimated Changed Area</span>
          <p className="text-base font-semibold text-white font-mono">{data.areaHa} ha</p>
          <span className="text-[11px] text-[#888888]">±0.3 ha statistical bound</span>
        </div>

        <div className="p-3 bg-[#141414] border border-[#212121] rounded-xl space-y-0.5 sm:col-span-2">
          <span className="text-[10px] uppercase font-mono text-[#737373]">Detected Sub-Class Partition</span>
          <div className="space-y-1.5 pt-1">
            {data.detectedClasses && data.detectedClasses.map((cls) => (
              <div key={cls.name} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#d4d4d4]">{cls.name}</span>
                  <span className="font-mono text-white">{cls.areaHa} ha ({cls.percentage}%)</span>
                </div>
                <div className="w-full h-1 bg-[#212121] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#888888] rounded-full"
                    style={{ width: `${cls.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
