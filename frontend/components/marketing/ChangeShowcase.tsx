"use client";

import { useState } from "react";
import { ArrowRight, Calendar, Check, Layers, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export function ChangeShowcase() {
  const [activeTab, setActiveTab] = useState<"before" | "after" | "change">("change");
  const [sliderPos, setSliderPos] = useState(55);

  return (
    <section className="relative w-full max-w-[1140px] mx-auto px-6 sm:px-8 py-20 border-t border-white/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[11px] tracking-wider uppercase text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span>TEMPORAL ANALYSIS</span>
          </div>

          <h2 className="text-[clamp(28px,3.8vw,44px)] font-medium leading-[1.1] tracking-tight text-white">
            See what changed.
          </h2>

          <p className="text-[15px] leading-relaxed text-neutral-400">
            Compare imagery across time, isolate changed regions, and surface the visual evidence
            behind each result. SatQuery runs bi-temporal pixel alignment, calculates area in real
            geographic coordinates, and verifies changes.
          </p>

          {/* Technical Metadata Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-3 text-center">
              <div className="font-mono text-[10px] uppercase text-neutral-400">Changed Area</div>
              <div className="mt-1 text-lg font-mono font-medium text-white">12.4 ha</div>
              <div className="text-[10px] text-emerald-400 font-mono">+14.2%</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-3 text-center">
              <div className="font-mono text-[10px] uppercase text-neutral-400">Change Type</div>
              <div className="mt-1 text-sm font-medium text-white truncate">Built-up</div>
              <div className="text-[10px] text-neutral-400 font-mono">Infrastructure</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0e0e0e] p-3 text-center">
              <div className="font-mono text-[10px] uppercase text-neutral-400">Confidence</div>
              <div className="mt-1 text-lg font-mono font-medium text-white">87%</div>
              <div className="text-[10px] text-neutral-400 font-mono">Calibrated</div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-200 hover:text-white transition-colors group"
            >
              <span>Test change detection in workspace</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Interactive Visual Showcase */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-white/15 bg-[#0e0e0e] p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Viewport Control Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("before")}
                  className={`rounded-lg px-3 py-1 text-xs font-mono transition-all ${
                    activeTab === "before"
                      ? "bg-white text-black font-medium"
                      : "text-neutral-400 hover:text-white bg-white/5"
                  }`}
                >
                  BEFORE (2024-01)
                </button>
                <button
                  onClick={() => setActiveTab("after")}
                  className={`rounded-lg px-3 py-1 text-xs font-mono transition-all ${
                    activeTab === "after"
                      ? "bg-white text-black font-medium"
                      : "text-neutral-400 hover:text-white bg-white/5"
                  }`}
                >
                  AFTER (2024-12)
                </button>
                <button
                  onClick={() => setActiveTab("change")}
                  className={`rounded-lg px-3 py-1 text-xs font-mono transition-all ${
                    activeTab === "change"
                      ? "bg-white text-black font-medium"
                      : "text-neutral-400 hover:text-white bg-white/5"
                  }`}
                >
                  CHANGE MAP
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-neutral-400">
                <Calendar className="h-3 w-3" />
                <span>Δt = 11 MONTHS</span>
              </div>
            </div>

            {/* Interactive Image Display */}
            <div className="relative h-72 sm:h-80 w-full rounded-xl border border-white/10 bg-[#060606] overflow-hidden flex items-center justify-center">
              {/* Raster Grid Background */}
              <div className="absolute inset-0 bg-tech-grid opacity-30" />

              {/* Geographic Overlay HUD */}
              <div className="absolute top-3 left-3 z-20 font-mono text-[10px] text-neutral-400 bg-black/70 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                <span>COORD: 18.552° N, 73.882° E · EPSG:32643</span>
              </div>

              {activeTab === "before" && (
                <div className="text-center space-y-2 z-10">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                    [T1 Baseline Sentinel-2 MSI Optical]
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">Date: 2024-01-12 | Cloud cover: 0.0%</p>
                </div>
              )}

              {activeTab === "after" && (
                <div className="text-center space-y-2 z-10">
                  <div className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                    [T2 Revisit Sentinel-2 MSI Optical]
                  </div>
                  <p className="text-xs text-neutral-400 font-mono">Date: 2024-12-18 | Cloud cover: 0.0%</p>
                </div>
              )}

              {activeTab === "change" && (
                <div className="w-full h-full p-8 flex flex-col justify-center items-center relative z-10">
                  {/* Simulated Detected Change Vector Polygons */}
                  <div className="w-64 h-40 rounded border-2 border-dashed border-red-400/60 bg-red-500/10 flex flex-col items-center justify-center p-3 relative">
                    <div className="absolute -top-3 left-3 bg-red-950 border border-red-500/40 text-red-300 font-mono text-[10px] px-2 py-0.5 rounded">
                      HOTSPOT 01: +12.4 ha
                    </div>
                    <span className="font-mono text-xs text-neutral-200 font-medium">
                      BUILT-UP EXPANSION DETECTED
                    </span>
                    <span className="font-mono text-[10px] text-neutral-400 mt-1">
                      Warp RMSE: 0.28 px · Otsu Threshold: 42.1
                    </span>
                  </div>
                </div>
              )}

              {/* Bottom Metadata bar */}
              <div className="absolute bottom-3 right-3 z-20 font-mono text-[10px] text-neutral-400 bg-black/70 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                <span>ALGORITHM: CHANGEFORMER V2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
