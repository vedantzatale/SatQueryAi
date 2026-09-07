"use client";

import React, { useState } from "react";
import { AnalysisTrace } from "@/lib/types";
import { ChevronDown, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutionDrawerProps {
  trace: AnalysisTrace;
}

export function ExecutionDrawer({ trace }: ExecutionDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalDuration = trace.executionSteps?.reduce((sum, step) => sum + (step.durationMs || 0), 0) ?? 0;

  return (
    <div className="w-full rounded-xl border border-[#262626] bg-[#0d0d0d] overflow-hidden transition-all shadow-subtle">
      {/* Header trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#121212] hover:bg-[#171717] transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-[#888888]" />
          <span className="text-xs font-medium text-[#e5e5e5]">
            How was this analyzed?
          </span>
          <span className="text-[11px] text-[#737373] font-mono">
            ({trace.executionSteps?.length || 0} pipeline stages • {totalDuration}ms)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#888888] font-mono hidden sm:inline">
            {trace.task}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#737373] transition-transform duration-200",
              isOpen && "rotate-180 text-white"
            )}
          />
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-[#1f1f1f] bg-[#0a0a0a] text-xs animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pb-2">
            <div className="p-2.5 bg-[#121212] border border-[#212121] rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#737373] tracking-wider block">
                Primary Task
              </span>
              <p className="font-medium text-white truncate">{trace.task}</p>
            </div>

            <div className="p-2.5 bg-[#121212] border border-[#212121] rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#737373] tracking-wider block">
                Input Sensors / Baseline
              </span>
              <p className="font-medium text-white truncate">{trace.sensor}</p>
            </div>

            <div className="p-2.5 bg-[#121212] border border-[#212121] rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-mono text-[#737373] tracking-wider block">
                Specialist Models
              </span>
              <div className="flex flex-wrap gap-1">
                {trace.models && trace.models.map((m) => (
                  <span
                    key={m}
                    className="inline-block px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[10px] text-[#d4d4d4] font-mono border border-[#2a2a2a]"
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
              <span className="text-[11px] uppercase font-mono text-[#737373] tracking-wider font-semibold">
                Observable Pipeline Execution
              </span>
              <span className="text-[10px] text-[#525252] font-mono">
                100% Deterministic & Grounded
              </span>
            </div>

            <div className="space-y-1.5">
              {trace.executionSteps && trace.executionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-[#121212]/60 border border-[#1f1f1f] hover:border-[#2e2e2e] transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[#e5e5e5] text-xs truncate">
                        {step.name}
                      </span>
                      <span className="font-mono text-[10px] text-[#737373] shrink-0">
                        {step.durationMs}ms
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888] mt-0.5 leading-normal">
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
