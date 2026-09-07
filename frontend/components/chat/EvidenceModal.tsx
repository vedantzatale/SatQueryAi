"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Check, Layers } from "lucide-react";

export function EvidenceModal() {
  const evidenceModalData = useAppStore((s) => s.evidenceModalData);
  const setEvidenceModalData = useAppStore((s) => s.setEvidenceModalData);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [downloaded, setDownloaded] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#121212] border border-[#2e2e2e] rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#212121] bg-[#0d0d0d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e]">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {evidenceModalData.title}
              </h3>
              <p className="text-xs text-[#737373] font-mono">
                Full-Resolution Spatial Evidence • UTM Projection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
              className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
              className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-[1px] bg-[#262626] mx-1" />

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#262626] text-white rounded-lg text-xs font-medium transition-colors"
            >
              {downloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
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
              className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#1a1a1a] transition-colors ml-2"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 overflow-auto bg-[#080808] relative flex items-center justify-center p-4 select-none">
          <div
            className="transition-transform duration-150 ease-out max-w-full max-h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evidenceModalData.image}
              alt={evidenceModalData.title}
              className="max-h-[60vh] sm:max-h-[65vh] object-contain rounded-lg shadow-2xl border border-[#212121]"
            />
          </div>
        </div>

        {/* Footer Metrics */}
        {evidenceModalData.metrics && evidenceModalData.metrics.length > 0 && (
          <div className="px-6 py-3 border-t border-[#212121] bg-[#0d0d0d] flex flex-wrap items-center gap-6 text-xs font-mono">
            {evidenceModalData.metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[#737373]">{m.label}:</span>
                <span className="text-white font-semibold">{m.value}</span>
                {m.change && (
                  <span className="text-[10px] text-[#a3a3a3] px-1.5 py-0.5 rounded bg-[#171717] border border-[#262626]">
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
