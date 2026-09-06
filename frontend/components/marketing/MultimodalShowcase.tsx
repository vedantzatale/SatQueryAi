"use client";

import { Check, Eye, Radio, Sparkles, Zap } from "lucide-react";

export function MultimodalShowcase() {
  return (
    <section className="relative w-full max-w-[1140px] mx-auto px-6 sm:px-8 py-20 border-t border-white/10">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] tracking-wider uppercase text-neutral-300">
          <Radio className="h-3 w-3 text-neutral-400" />
          <span>COMPLEMENTARY MODALITIES</span>
        </div>

        <h2 className="text-[clamp(28px,3.8vw,44px)] font-medium leading-[1.1] tracking-tight text-white">
          Combine perspectives.
        </h2>

        <p className="text-[15px] leading-relaxed text-neutral-400">
          Optical and SAR imagery capture fundamentally different properties of the Earth.
          SatQuery brings those signals together when the question requires it, cross-validating
          spectral reflectance against radar backscatter.
        </p>
      </div>

      {/* Multimodal Architecture Diagram (OPTICAL + SAR = MULTIMODAL UNDERSTANDING) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Optical Panel */}
        <div className="md:col-span-5 rounded-2xl border border-white/15 bg-[#0e0e0e] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
              <Eye className="h-4 w-4 text-neutral-300" />
              <span>OPTICAL (MSI)</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
              VNIR / SWIR
            </span>
          </div>

          <div className="h-48 rounded-xl border border-white/10 bg-[#080808] p-4 flex flex-col justify-between font-mono relative overflow-hidden">
            <div className="text-[11px] text-neutral-400">SPECTRAL SIGNATURES</div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>• Surface color & chlorophyll reflectance</div>
              <div>• Water absorption in NIR</div>
              <div>• Cloud/shadow sensitivity</div>
            </div>
            <div className="text-[10px] text-neutral-400 border-t border-white/5 pt-2">
              SENSOR: SENTINEL-2 L2A · 10M GSD
            </div>
          </div>
        </div>

        {/* Math Operator Indicator */}
        <div className="md:col-span-2 flex flex-col items-center justify-center py-2 text-neutral-400 font-mono text-sm">
          <div className="h-8 w-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center font-bold text-white mb-1">
            +
          </div>
          <span className="text-[11px] uppercase tracking-wider text-neutral-400">FUSION</span>
        </div>

        {/* SAR Panel */}
        <div className="md:col-span-5 rounded-2xl border border-white/15 bg-[#0e0e0e] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-white">
              <Radio className="h-4 w-4 text-neutral-300" />
              <span>SAR (RADAR)</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
              C-BAND VV/VH
            </span>
          </div>

          <div className="h-48 rounded-xl border border-white/10 bg-[#080808] p-4 flex flex-col justify-between font-mono relative overflow-hidden">
            <div className="text-[11px] text-neutral-400">STRUCTURAL BACKSCATTER</div>
            <div className="space-y-1 text-xs text-neutral-300">
              <div>• Double-bounce corner reflectors</div>
              <div>• All-weather day/night penetration</div>
              <div>• Surface roughness & moisture</div>
            </div>
            <div className="text-[10px] text-neutral-400 border-t border-white/5 pt-2">
              SENSOR: SENTINEL-1 IW GRD · 10M GSD
            </div>
          </div>
        </div>
      </div>

      {/* Multimodal Result Summary Strip */}
      <div className="mt-6 rounded-xl border border-white/10 bg-[#0d0d0d] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-300">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
            ✓
          </span>
          <span>
            <strong className="text-white font-medium">Cross-modal validation:</strong> Optical
            built-up hypotheses verified by SAR double-bounce intensity.
          </span>
        </div>
        <div className="text-neutral-400 text-[11px]">
          MODEL: SATQUERY FUSION (TERRAMIND 1.0)
        </div>
      </div>
    </section>
  );
}
