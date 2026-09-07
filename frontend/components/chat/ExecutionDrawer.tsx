"use client";

import React, { useState } from "react";
import { AnalysisTrace } from "@/lib/types";
import { ChevronDown, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";

interface ExecutionDrawerProps {
  trace: AnalysisTrace;
}

export function ExecutionDrawer({ trace }: ExecutionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const totalDuration = trace.executionSteps?.reduce((sum, step) => sum + (step.durationMs || 0), 0) ?? 0;

  return (
    <div className={`w-full rounded-xl border overflow-hidden transition-all shadow-subtle ${
      isLight ? "border-black/10 bg-[#fcfbf8]" : "border-[#262626] bg-[#0d0d0d]"
    }`}>
      {/* Header trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
          isLight ? "bg-[#ede8df] hover:bg-[#e4ded3]" : "bg-[#121212] hover:bg-[#171717]"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Activity className={`w-4 h-4 ${isLight ? "text-neutral-600" : "text-[#888888]"}`} />
          <span className={`text-xs font-medium ${isLight ? "text-neutral-950" : "text-[#e5e5e5]"}`}>
            How was this analyzed?
          </span>
          <span className={`text-[11px] font-mono ${isLight ? "text-neutral-600" : "text-[#737373]"}`}>
            ({trace.executionSteps?.length || 0} pipeline stages • {totalDuration}ms)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono hidden sm:inline ${isLight ? "text-neutral-600" : "text-[#888888]"}`}>
            {trace.task}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen ? (isLight ? "rotate-180 text-black" : "rotate-180 text-white") : (isLight ? "text-neutral-600" : "text-[#737373]")
            )}
          />
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div className={`p-4 space-y-4 border-t text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
          isLight ? "border-black/10 bg-[#f5f2eb]" : "border-[#1f1f1f] bg-[#0a0a0a]"
        }`}>
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-2">
            <div className={`p-2.5 rounded-lg space-y-1 border ${
              isLight ? "bg-[#ede8df] border-black/10" : "bg-[#121212] border-[#212121]"
            }`}>
              <span className={`text-[10px] uppercase font-mono tracking-wider block ${
                isLight ? "text-neutral-600" : "text-[#737373]"
              }`}>
                Primary Task
              </span>
              <p className={`font-medium truncate ${isLight ? "text-neutral-950" : "text-white"}`}>{trace.task}</p>
            </div>

            <div className={`p-2.5 rounded-lg space-y-1 border ${
              isLight ? "bg-[#ede8df] border-black/10" : "bg-[#121212] border-[#212121]"
            }`}>
              <span className={`text-[10px] uppercase font-mono tracking-wider block ${
                isLight ? "text-neutral-600" : "text-[#737373]"
              }`}>
                Input Sensors / Baseline
              </span>
              <p className={`font-medium truncate ${isLight ? "text-neutral-950" : "text-white"}`}>{trace.sensor}</p>
            </div>

            <div className={`p-2.5 rounded-lg space-y-1 border ${
              isLight ? "bg-[#ede8df] border-black/10" : "bg-[#121212] border-[#212121]"
            }`}>
              <span className={`text-[10px] uppercase font-mono tracking-wider block ${
                isLight ? "text-neutral-600" : "text-[#737373]"
              }`}>
                Specialist Models
              </span>
              <div className="flex flex-wrap gap-1">
                {trace.models && trace.models.map((m) => (
                  <span
                    key={m}
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      isLight ? "bg-[#fcfbf8] text-neutral-800 border-black/10" : "bg-[#1f1f1f] text-[#d4d4d4] border-[#2a2a2a]"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step by Step Execution Process */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] uppercase font-mono tracking-wider font-semibold ${
                isLight ? "text-neutral-700" : "text-[#737373]"
              }`}>
                Observable Pipeline Execution
              </span>
              <span className={`text-[10px] font-mono ${isLight ? "text-neutral-500" : "text-[#525252]"}`}>
                100% Deterministic & Grounded
              </span>
            </div>

            <div className="space-y-1.5">
              {trace.executionSteps && trace.executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors ${
                    isLight
                      ? "bg-[#ede8df]/70 border-black/10 hover:border-black/20"
                      : "bg-[#121212]/60 border-[#1f1f1f] hover:border-[#2e2e2e]"
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isLight ? "text-neutral-900" : "text-white"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-medium text-xs truncate ${isLight ? "text-neutral-950" : "text-[#e5e5e5]"}`}>
                        {step.name}
                      </span>
                      <span className={`font-mono text-[10px] shrink-0 ${isLight ? "text-neutral-600" : "text-[#737373]"}`}>
                        {step.durationMs}ms
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 leading-normal ${isLight ? "text-neutral-600" : "text-[#888888]"}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
