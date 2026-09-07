"use client";

import {
  ArrowDown,
  CheckCircle2,
  Cpu,
  FileCheck,
  HelpCircle,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

export function Workflow() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const steps = [
    {
      num: "01",
      title: "Query Understanding",
      desc: "Detects query language (English/Hindi/Hinglish), extracts location coordinates, and identifies task intent.",
      model: "SatQuery Agent",
    },
    {
      num: "02",
      title: "Input Validation & Modality Detection",
      desc: "Inspects GeoTIFF CRS, dimensions, resolution, and pixel statistics. Detects optical vs SAR without guessing.",
      model: "GDAL / Rasterio Inspector",
    },
    {
      num: "03",
      title: "Task Routing & Policy Enforcement",
      desc: "Deterministic policy validator ensures models only run when required image pairs and modalities exist.",
      model: "Compatibility Matrix",
    },
    {
      num: "04",
      title: "Specialist Model Execution",
      desc: "Routes task to domain-adapted model (RS-VLM, ChangeFormer, Prithvi, or TerraMind) with fallback guarantees.",
      model: "Model Registry",
    },
    {
      num: "05",
      title: "Evidence Generation",
      desc: "Renders visual bounding box overlays, change masks, and reprojects pixel coordinates to real-world WGS84.",
      model: "Geo-Renderer",
    },
    {
      num: "06",
      title: "Confidence Calibration & Output",
      desc: "Non-fabricating confidence scoring validates input quality, evidence quality, and cross-modality agreement.",
      model: "Audit Pipeline",
    },
  ];

  return (
    <section className={`relative w-full max-w-[1140px] mx-auto px-6 sm:px-8 py-20 border-t ${isLight ? "border-black/10" : "border-white/10"} transition-colors duration-200`}>
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
        <div className={`inline-flex items-center gap-2 rounded-full border ${isLight ? "border-black/10 bg-black/5 text-neutral-700" : "border-white/10 bg-white/[0.03] text-neutral-300"} px-3.5 py-1 font-mono text-[11px] tracking-wider uppercase`}>
          <Network className={`h-3 w-3 ${isLight ? "text-neutral-600" : "text-neutral-400"}`} />
          <span>OBSERVABLE AGENTIC PIPELINE</span>
        </div>

        <h2 className={`text-[clamp(34px,4.6vw,56px)] font-bold sm:font-semibold leading-[1.06] tracking-[-0.025em] ${isLight ? "text-neutral-900" : "text-white"}`}>
          How SatQuery analyzes.
        </h2>

        <p className={`text-[16px] sm:text-[17.5px] leading-[1.65] ${isLight ? "text-neutral-600" : "text-neutral-300"} font-normal`}>
          SatQuery routes questions through a deterministic, auditable multi-stage pipeline rather
          than feeding raw satellite data directly into an ungrounded black-box chatbot.
        </p>
      </div>

      {/* Grid of Steps with connection flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`tech-card rounded-2xl p-6 flex flex-col justify-between relative group ${isLight ? "!bg-[#fcfbf8] !border-black/10 !shadow-sm" : ""}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-xs ${isLight ? "text-neutral-700 font-bold" : "text-neutral-400 font-semibold"}`}>{step.num}</span>
                <span className={`font-mono text-[10px] ${isLight ? "text-neutral-700 border-black/10 bg-black/5" : "text-neutral-400 border-white/10 bg-white/5"} border px-2 py-0.5 rounded`}>
                  {step.model}
                </span>
              </div>
              <h3 className={`text-base font-semibold ${isLight ? "text-neutral-900" : "text-white"} mb-2 tracking-tight`}>{step.title}</h3>
              <p className={`text-[13px] leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"}`}>{step.desc}</p>
            </div>

            <div className={`mt-5 pt-3 border-t ${isLight ? "border-black/10 text-neutral-500" : "border-white/5 text-neutral-400"} flex items-center justify-between text-[10px] font-mono`}>
              <span>AUDIT VERIFIED</span>
              <span className={`h-1.5 w-1.5 rounded-full ${isLight ? "bg-neutral-400 group-hover:bg-neutral-900" : "bg-white/30 group-hover:bg-white"} transition-colors`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
