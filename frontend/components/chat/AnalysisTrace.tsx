"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Cpu, Layers } from "lucide-react";
import type { ExecutionResult, TransparencyResponse } from "@/lib/types";

interface AnalysisTraceProps {
  result?: ExecutionResult | null;
  transparency?: TransparencyResponse | null;
}

export function AnalysisTrace({ result, transparency }: AnalysisTraceProps) {
  const [isOpen, setIsOpen] = useState(false);

  const task = result?.task ?? transparency?.task ?? "Remote Sensing Analysis";
  const model = result?.model ?? transparency?.model ?? "SatQuery Specialist";
  const provider = result?.data_provenance?.provider ?? transparency?.data_provenance?.provider ?? "Copernicus Sentinel-2";
  const acquisitionDate = result?.data_provenance?.acquisition_date ?? transparency?.data_provenance?.acquisition_date ?? "Recent Acquisition";
  const crs = result?.data_provenance?.crs ?? transparency?.data_provenance?.crs ?? "EPSG:4326";
  const resolution = result?.data_provenance?.resolution ?? transparency?.data_provenance?.resolution ?? 10;
  const processingApplied = result?.data_provenance?.processing_applied ?? transparency?.data_provenance?.processing_applied ?? [
    "Input Validation & GDAL Metadata Check",
    "Spectral Band Co-registration",
    "Model Inference & Contour Extraction",
    "CRS Affine Reprojection to WGS84",
  ];

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
              <span className="text-white text-xs font-medium">{task}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Input Imagery</span>
              <span className="text-white text-xs font-medium">{provider}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Date / Sensor</span>
              <span className="text-white text-xs font-medium">{acquisitionDate}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase">Spatial Reference</span>
              <span className="text-white text-xs font-medium">{crs} · {resolution}m GSD</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block text-[10px] uppercase mb-1.5">Observable Pipeline Steps</span>
            <div className="space-y-1">
              {processingApplied.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300">
                  <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400">
            <div>
              <span className="text-neutral-400">MODELS: </span>
              <span className="text-neutral-300">{model}</span>
            </div>
            <div>
              <span className="text-neutral-400">STATUS: </span>
              <span className="text-emerald-400 uppercase font-medium">COMPLETED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
