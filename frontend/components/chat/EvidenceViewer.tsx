"use client";

import { useState } from "react";
import { Download, Eye, Layers, Maximize2, X } from "lucide-react";
import { evidenceImageUrl, reportGeoJsonUrl, reportPdfUrl } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import type { Evidence, ExecutionResult } from "@/lib/types";

interface EvidenceViewerProps {
  evidence: Evidence[];
  executionId?: string;
}

export function EvidenceViewer({ evidence, executionId }: EvidenceViewerProps) {
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; label: string } | null>(null);

  if (!evidence || evidence.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-neutral-400" />
          <span className="uppercase tracking-wider">Grounding & Evidence ({evidence.length})</span>
        </div>
        {executionId && (
          <div className="flex items-center gap-3">
            <a
              href={reportPdfUrl(executionId)}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>PDF Dossier</span>
              <Download className="h-3 w-3" />
            </a>
            <span>•</span>
            <a
              href={reportGeoJsonUrl(executionId)}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GeoJSON</span>
              <Download className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Grid of Evidence Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {evidence.map((ev, i) => {
          const imgUrl = ev.storage_key ? evidenceImageUrl(ev.storage_key) : null;
          const displayLabel = ev.label ?? ev.type;

          return (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 flex flex-col justify-between group"
            >
              {imgUrl ? (
                <div className="relative h-44 w-full rounded-lg bg-neutral-900 border border-white/5 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={displayLabel}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback placeholder if storage object isn't present in local mock
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <button
                    onClick={() => setFullscreenImage({ url: imgUrl, label: displayLabel })}
                    className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    aria-label="View Fullscreen"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-44 w-full rounded-lg bg-tech-grid border border-white/5 flex flex-col items-center justify-center p-4 text-center font-mono text-xs text-neutral-400">
                  <span className="uppercase text-[10px] text-neutral-400 tracking-wider">Spatial Vector</span>
                  <span className="text-white mt-1 font-medium">{displayLabel}</span>
                  {ev.area_m2 && (
                    <span className="text-emerald-400 text-[11px] mt-1">
                      {ev.area_m2.toLocaleString()} m² ({ev.area_percentage?.toFixed(1)}%)
                    </span>
                  )}
                </div>
              )}

              <div className="mt-2.5 flex items-center justify-between font-mono text-[11px]">
                <span className="text-neutral-300 truncate">{displayLabel}</span>
                {ev.score != null && (
                  <span className="text-neutral-400">{(ev.score * 100).toFixed(0)}% score</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Image Preview Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute -top-10 right-0 text-neutral-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullscreenImage.url}
              alt={fullscreenImage.label}
              className="max-h-[80vh] w-auto rounded-xl border border-white/20 object-contain shadow-2xl"
            />
            <div className="mt-3 font-mono text-xs text-neutral-300">
              {fullscreenImage.label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
