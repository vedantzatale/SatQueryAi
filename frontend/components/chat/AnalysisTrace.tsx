"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronRight } from "lucide-react";
import type { ExecutionResult, TransparencyResponse } from "@/lib/types";

interface AnalysisTraceProps {
  result?: ExecutionResult | null;
  transparency?: TransparencyResponse | null;
}

export function AnalysisTrace({ result, transparency }: AnalysisTraceProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Every field here reflects the real execution record. When a value is
  // genuinely absent (e.g. no CRS on a non-georeferenced upload, or no
  // processing steps recorded yet), it's shown as "not available" rather
  // than backfilled with a plausible-looking placeholder -- this panel's
  // entire purpose is truthful disclosure of what actually happened.
  const status = result?.status ?? null;
  const task = result?.task ?? transparency?.task ?? null;
  const model = result?.model ?? transparency?.model ?? null;
  const provenance = result?.data_provenance ?? transparency?.data_provenance ?? null;
  const provider = provenance?.provider ?? null;
  const acquisitionDate = provenance?.acquisition_date ?? null;
  const crs = provenance?.crs ?? null;
  const resolution = provenance?.resolution ?? null;
  const processingApplied = provenance?.processing_applied ?? [];
  const modelProvenance = result?.model_provenance ?? transparency?.model_provenance ?? null;

  return (
    <div className="border-t border-white/10 pt-3 text-xs font-mono">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
      >
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span className="text-[11px] uppercase tracking-wider">How was this analyzed? (Audit Trace)</span>
      </button>

      {isOpen && (
        <div className="mt-3 rounded-xl border border-white/10 bg-[#090909] p-4 space-y-3 animate-fade-in text-neutral-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-white/5 pb-3">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Task</span>
              <span className="text-white text-xs font-medium">{task ?? "not available"}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Input Imagery</span>
              <span className="text-white text-xs font-medium">{provider ?? "not available"}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Date / Sensor</span>
              <span className="text-white text-xs font-medium">{acquisitionDate ?? "not available"}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Spatial Reference</span>
              <span className="text-white text-xs font-medium">
                {crs ?? "no CRS (ungeoreferenced)"}
                {resolution != null ? ` · ${resolution}m GSD` : ""}
              </span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block text-[10px] uppercase mb-1.5">Observable Pipeline Steps</span>
            <div className="space-y-1">
              {processingApplied.length > 0 ? (
                processingApplied.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300">
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))
              ) : (
                <span className="text-[11px] text-neutral-500">No processing steps recorded</span>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400">
            <div>
              <span className="text-neutral-400">MODELS: </span>
              <span className="text-neutral-300">
                {model ?? "not available"}
                {modelProvenance?.version ? ` (v${modelProvenance.version})` : ""}
              </span>
            </div>
            <div>
              <span className="text-neutral-400">STATUS: </span>
              <span
                className={`uppercase font-medium ${
                  status === "completed"
                    ? "text-emerald-400"
                    : status === "failed"
                    ? "text-red-400"
                    : "text-amber-400"
                }`}
              >
                {status ?? "unknown"}
              </span>
            </div>
          </div>

          {modelProvenance?.fallback_used && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-[11px] text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                The primary model for this capability was unavailable; a registered fallback
                ran instead.
                {modelProvenance.fallback_reason ? ` Reason: ${modelProvenance.fallback_reason}` : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
