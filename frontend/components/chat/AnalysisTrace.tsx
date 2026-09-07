"use client";

import { useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronRight, X } from "lucide-react";
import { getTransparency } from "@/lib/api";
import { useTheme } from "@/lib/theme";
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

  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div className={`border-t pt-3 text-xs font-mono ${isLight ? "border-black/10" : "border-white/10"}`}>
      <button
        onClick={handleToggle}
        className={`flex items-center gap-2 transition-colors ${isLight ? "text-neutral-600 hover:text-black" : "text-neutral-400 hover:text-white"}`}
      >
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <span className="text-[11px] uppercase tracking-wider">How was this analyzed? (Audit Trace)</span>
      </button>

      {isOpen && (
        <div className={`mt-3 rounded-xl border p-4 space-y-3 animate-fade-in ${
          isLight ? "border-black/10 bg-[#ede8df] text-neutral-800 shadow-sm" : "border-white/10 bg-[#090909] text-neutral-300"
        }`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 border-b pb-3 ${
            isLight ? "border-black/10" : "border-white/5"
          }`}>
            <div>
              <span className={`block text-[10px] uppercase ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Task</span>
              <span className={`text-xs font-medium ${isLight ? "text-neutral-950" : "text-white"}`}>{task ?? "not available"}</span>
            </div>
            <div>
              <span className={`block text-[10px] uppercase ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Input Imagery</span>
              <span className={`text-xs font-medium ${isLight ? "text-neutral-950" : "text-white"}`}>{provider ?? "not available"}</span>
            </div>
            <div>
              <span className={`block text-[10px] uppercase ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Date / Sensor</span>
              <span className={`text-xs font-medium ${isLight ? "text-neutral-950" : "text-white"}`}>{acquisitionDate ?? "not available"}</span>
            </div>
            <div>
              <span className={`block text-[10px] uppercase ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>Spatial Reference</span>
              <span className={`text-xs font-medium ${isLight ? "text-neutral-950" : "text-white"}`}>
                {crs ?? "no CRS (ungeoreferenced)"}
                {resolution != null ? ` · ${resolution}m GSD` : ""}
              </span>
            </div>
          </div>

          <div>
            <span className={`block text-[10px] uppercase mb-1.5 ${isLight ? "text-neutral-600" : "text-neutral-400"}`}>
              Execution Steps (audit trail)
            </span>
            <div className="space-y-1.5">
              {stepsLoading ? (
                <span className={`text-[11px] ${isLight ? "text-neutral-600" : "text-neutral-500"}`}>Loading real execution trace…</span>
              ) : steps && steps.length > 0 ? (
                steps.map((step, idx) => (
                  <div key={idx} className={`flex items-start gap-2 text-[11px] ${isLight ? "text-neutral-800" : "text-neutral-300"}`}>
                    {step.status === "ok" ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                    ) : step.status === "error" || step.status === "failed" ? (
                      <X className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span>
                      <span className={`font-medium ${isLight ? "text-neutral-950" : "text-white"}`}>{step.step}</span>
                      {step.detail && Object.keys(step.detail).length > 0 && (
                        <span className={isLight ? "text-neutral-600" : "text-neutral-500"}> — {formatDetail(step.detail)}</span>
                      )}
                    </span>
                  </div>
                ))
              ) : stepsError || processingApplied.length === 0 ? (
                <span className={`text-[11px] ${isLight ? "text-neutral-600" : "text-neutral-500"}`}>No execution trace recorded</span>
              ) : (
                // Fallback: the coarser preprocessing-only list embedded in
                // the result itself, when the full step trace isn't
                // reachable (e.g. a mock/demo session with no real
                // execution_id to fetch).
                processingApplied.map((step, idx) => (
                  <div key={idx} className={`flex items-center gap-2 text-[11px] ${isLight ? "text-neutral-800" : "text-neutral-300"}`}>
                    <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`border-t pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] ${
            isLight ? "border-black/10 text-neutral-600" : "border-white/5 text-neutral-400"
          }`}>
            <div>
              <span className={isLight ? "text-neutral-600" : "text-neutral-400"}>MODELS: </span>
              <span className={isLight ? "text-neutral-900 font-medium" : "text-neutral-300"}>
                {model ?? "not available"}
                {modelProvenance?.version ? ` (v${modelProvenance.version})` : ""}
              </span>
            </div>
            <div>
              <span className={isLight ? "text-neutral-600" : "text-neutral-400"}>STATUS: </span>
              <span
                className={`uppercase font-medium ${
                  status === "completed"
                    ? "text-emerald-500"
                    : status === "failed"
                    ? "text-red-500"
                    : "text-amber-500"
                }`}
              >
                {status ?? "unknown"}
              </span>
            </div>
          </div>

          {modelProvenance?.fallback_used && (
            <div className={`flex items-start gap-2 rounded-lg border p-2.5 text-[11px] ${
              isLight ? "border-amber-600/30 bg-amber-500/15 text-amber-900" : "border-amber-500/30 bg-amber-500/5 text-amber-300"
            }`}>
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
