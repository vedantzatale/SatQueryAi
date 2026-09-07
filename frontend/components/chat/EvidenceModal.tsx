"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Check, Layers } from "lucide-react";

export function EvidenceModal() {
  const evidenceModalData = useAppStore((s) => s.evidenceModalData);
  const setEvidenceModalData = useAppStore((s) => s.setEvidenceModalData);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [downloaded, setDownloaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  if (!evidenceModalData) return null;

  const handleDownload = () => {
    setDownloaded(true);
    // Trigger download of image
    const a = document.createElement("a");
    a.href = evidenceModalData.image;
    a.download = `${evidenceModalData.title.toLowerCase().replace(/\s+/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className={`relative w-full max-w-5xl h-[85vh] border rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
        isLight ? "border-black/10 bg-[#fcfbf8]" : "border-[#2e2e2e] bg-[#121212]"
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? "border-black/10 bg-[#ede8df]" : "border-[#212121] bg-[#0d0d0d]"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isLight ? "bg-[#fcfbf8] border-black/10" : "bg-[#1a1a1a] border-[#2e2e2e]"
            }`}>
              <Layers className={`w-4 h-4 ${isLight ? "text-neutral-900" : "text-white"}`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>
                {evidenceModalData.title}
              </h3>
              <p className={`text-xs font-mono ${isLight ? "text-neutral-500" : "text-[#737373]"}`}>
                Full-Resolution Spatial Evidence • UTM Projection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
              className={`p-2 rounded-lg transition-colors ${
                isLight ? "text-neutral-600 hover:text-black hover:bg-black/5" : "text-[#737373] hover:text-white hover:bg-[#1a1a1a]"
              }`}
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
              className={`p-2 rounded-lg transition-colors ${
                isLight ? "text-neutral-600 hover:text-black hover:bg-black/5" : "text-[#737373] hover:text-white hover:bg-[#1a1a1a]"
              }`}
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className={`p-2 rounded-lg transition-colors ${
                isLight ? "text-neutral-600 hover:text-black hover:bg-black/5" : "text-[#737373] hover:text-white hover:bg-[#1a1a1a]"
              }`}
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className={`h-4 w-[1px] mx-1 ${isLight ? "bg-black/10" : "bg-[#262626]"}`} />

            <button
              type="button"
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isLight ? "bg-[#18181b] hover:bg-[#27272a] text-white" : "bg-[#1f1f1f] hover:bg-[#262626] text-white"
              }`}
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setEvidenceModalData(null)}
              className={`p-2 rounded-lg transition-colors ml-2 ${
                isLight ? "text-neutral-600 hover:text-black hover:bg-black/5" : "text-[#737373] hover:text-white hover:bg-[#1a1a1a]"
              }`}
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className={`flex-1 overflow-auto relative flex items-center justify-center p-4 select-none ${
          isLight ? "bg-[#f5f2eb]" : "bg-[#080808]"
        }`}>
          <div
            className="transition-transform duration-150 ease-out max-w-full max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evidenceModalData.image}
              alt={evidenceModalData.title}
              className={`max-h-[60vh] sm:max-h-[65vh] object-contain rounded-lg shadow-2xl border ${
                isLight ? "border-black/10" : "border-[#212121]"
              }`}
            />
          </div>
        </div>

        {/* Footer Metrics */}
        {evidenceModalData.metrics && evidenceModalData.metrics.length > 0 && (
          <div className={`px-6 py-3 border-t flex flex-wrap items-center gap-6 text-xs font-mono ${
            isLight ? "border-black/10 bg-[#ede8df]" : "border-[#212121] bg-[#0d0d0d]"
          }`}>
            {evidenceModalData.metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={isLight ? "text-neutral-600" : "text-[#737373]"}>{m.label}:</span>
                <span className={`font-semibold ${isLight ? "text-neutral-900" : "text-white"}`}>{m.value}</span>
                {m.change && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    isLight ? "text-neutral-800 bg-[#fcfbf8] border-black/10" : "text-[#a3a3a3] bg-[#171717] border-[#262626]"
                  }`}>
                    {m.change}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
