"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { getTransparency } from "@/lib/api";
import type { ExecutionResult, TransparencyResponse, TransparencyStep } from "@/lib/types";

interface AnalysisTraceProps {
  result?: ExecutionResult | null;
  transparency?: TransparencyResponse | null;
}

function formatDetail(detail: Record<string, unknown>): string {
  const entries = Object.entries(detail);
  if (entries.length === 0) return "";
  return entries.map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ");
}

export function AnalysisTrace({ result, transparency }: AnalysisTraceProps) {
  const [isOpen, setIsOpen] = useState(false);
  // The real per-state-machine-step audit trail (basic_validation ->
  // query_understanding -> ... -> completed, each with real status/detail)
  // is richer than what's embedded in ExecutionResult, so it's fetched
  // lazily on first expand rather than eagerly for every message.
  const [steps, setSteps] = useState<TransparencyStep[] | null>(transparency?.processing_steps ?? null);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState(false);

  function handleToggle() {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening && steps === null && !stepsLoading && result?.execution_id) {
      setStepsLoading(true);
      getTransparency(result.execution_id)
        .then((data) => setSteps(data.processing_steps))
        .catch(() => setStepsError(true))
        .finally(() => setStepsLoading(false));
    }
  }

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
        onClick={handleToggle}
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
            <span className="text-neutral-400 block text-[10px] uppercase mb-1.5">
              Execution Steps (audit trail)
            </span>
            <div className="space-y-1.5">
              {stepsLoading ? (
                <span className="text-[11px] text-neutral-500">Loading real execution trace…</span>
              ) : steps && steps.length > 0 ? (
                steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-neutral-300">
                    {step.status === "ok" ? (
                      <Check className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                    ) : step.status === "error" || step.status === "failed" ? (
                      <X className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <span>
                      <span className="text-white">{step.step}</span>
                      {step.detail && Object.keys(step.detail).length > 0 && (
                        <span className="text-neutral-500"> — {formatDetail(step.detail)}</span>
                      )}
                    </span>
                  </div>
                ))
              ) : stepsError || processingApplied.length === 0 ? (
                <span className="text-[11px] text-neutral-500">No execution trace recorded</span>
              ) : (
                // Fallback: the coarser preprocessing-only list embedded in
                // the result itself, when the full step trace isn't
                // reachable (e.g. a mock/demo session with no real
                // execution_id to fetch).
                processingApplied.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300">
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))
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
