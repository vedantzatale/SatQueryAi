"use client";

import { useState } from "react";
import { evidenceImageUrl, getTransparency } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { TransparencyResponse } from "@/lib/types";

function ConfidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-red-100 text-red-700",
    unavailable: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[level] ?? colors.unavailable}`}>
      {level}
    </span>
  );
}

export function EvidencePanel() {
  const result = useAppStore((s) => s.lastResult);
  const [transparency, setTransparency] = useState<TransparencyResponse | null>(null);
  const [loadingTransparency, setLoadingTransparency] = useState(false);

  async function handleShowTransparency() {
    if (!result) return;
    setLoadingTransparency(true);
    try {
      const data = await getTransparency(result.execution_id);
      setTransparency(data);
    } finally {
      setLoadingTransparency(false);
    }
  }

  if (!result || result.status === "requires_user_input") {
    return (
      <aside className="flex h-full w-96 flex-col border-l border-slate-200 bg-white p-4 text-sm text-slate-400">
        Evidence, confidence, and analysis details will appear here once you ask a question.
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-96 flex-col overflow-y-auto border-l border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">Analysis</h2>

      {result.model_provenance?.demo_mode && (
        <div className="mt-2 rounded-md bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
          Demo data — mock model output, not a real remote-sensing prediction
        </div>
      )}

      <div className="mt-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Answer</div>
        <p className="mt-1 text-sm text-slate-800">{result.answer ?? "—"}</p>
      </div>

      {result.evidence.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Evidence</div>
          <div className="mt-2 space-y-2">
            {result.evidence.map((ev, i) => (
              <div key={i} className="rounded-md border border-slate-200 p-2">
                {ev.storage_key && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evidenceImageUrl(ev.storage_key)}
                    alt={ev.label ?? ev.type}
                    className="w-full rounded-md"
                  />
                )}
                <div className="mt-1 text-xs text-slate-500">
                  {ev.type}
                  {ev.label ? ` — ${ev.label}` : ""}
                  {ev.area_m2 != null ? ` — ${ev.area_m2.toLocaleString()} m²` : ""}
                  {ev.area_percentage != null ? ` (${ev.area_percentage.toFixed(2)}%)` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.confidence && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Confidence</div>
          <div className="mt-1 flex items-center gap-2">
            <ConfidenceBadge level={result.confidence.overall_level} />
            <span className="text-xs text-slate-500">
              {result.confidence.mode === "demo_heuristic" ? "Demo mode (not calibrated)" : "Calibrated"}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-slate-600">
            <div>Input quality: {result.confidence.input_quality}</div>
            <div>Evidence quality: {result.confidence.evidence_quality}</div>
            {result.confidence.modality_agreement !== "not_applicable" && (
              <div className="col-span-2">Modality agreement: {result.confidence.modality_agreement}</div>
            )}
          </div>
          {result.confidence.notes.map((note, i) => (
            <div key={i} className="mt-1 text-xs text-amber-700">
              {note}
            </div>
          ))}
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Warnings</div>
          <ul className="mt-1 list-disc pl-4 text-xs text-amber-700">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {result.data_provenance && (
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Data</div>
          <div className="mt-1 text-xs text-slate-600">
            <div>Source: {result.data_provenance.provider ?? "unknown"}</div>
            {result.data_provenance.crs && <div>CRS: {result.data_provenance.crs}</div>}
            {result.data_provenance.resolution && (
              <div>Resolution: {result.data_provenance.resolution}m/pixel</div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <button
          onClick={handleShowTransparency}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {loadingTransparency ? "Loading..." : "How Was This Analyzed?"}
        </button>
        {transparency && (
          <div className="mt-3 space-y-2 text-xs text-slate-600">
            <div>
              <span className="font-medium text-slate-800">Task:</span> {transparency.task}
            </div>
            <div>
              <span className="font-medium text-slate-800">Model:</span> {transparency.model} (
              {transparency.model_version})
            </div>
            {transparency.model_provenance?.fallback_used && (
              <div className="rounded-md bg-amber-50 px-2 py-1 text-amber-800">
                {transparency.model_provenance.fallback_reason}
              </div>
            )}
            <div>
              <span className="font-medium text-slate-800">Processing:</span>{" "}
              {transparency.processing_steps.map((s) => s.step).join(" → ")}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
        PDF and GeoJSON export are not yet implemented in this build.
      </div>
    </aside>
  );
}
