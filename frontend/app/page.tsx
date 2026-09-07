"use client";

import { Compass, FileCheck, Layers, Sparkles } from "lucide-react";
import AirlockHero from "@/components/marketing/AirlockHero";
import { ChangeShowcase } from "@/components/marketing/ChangeShowcase";
import { FAQ } from "@/components/marketing/FAQ";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { MultimodalShowcase } from "@/components/marketing/MultimodalShowcase";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { Workflow } from "@/components/marketing/Workflow";
import { useTheme } from "@/lib/theme";

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <SmoothScroll>
      <div className={`min-h-screen ${isLight ? "bg-[#f5f2eb] text-[#18181b]" : "bg-[#080808] text-neutral-100"} flex flex-col font-sans selection:bg-white selection:text-black transition-colors duration-200`}>
        <Navbar />

        <main className="flex-1">
          {/* Airlock Interactive Scroll-Locked Video Hero */}
          <AirlockHero />

          {/* Hero Section (2-Section Design) */}
          <Hero />

          {/* Editorial Section: One interface for difficult imagery */}
          <section className={`py-24 border-t ${isLight ? "border-black/10 bg-[#ede8df]" : "border-white/10 bg-[#0a0a0a]"}`} id="features">
            <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
              <div className="max-w-3xl mb-16 space-y-4">
                <div className={`inline-flex items-center gap-2 rounded-full border ${isLight ? "border-black/10 bg-black/5 text-neutral-700" : "border-white/10 bg-white/[0.03] text-neutral-300"} px-3.5 py-1 font-mono text-[11px] tracking-wider uppercase`}>
                  <Compass className={`h-3 w-3 ${isLight ? "text-neutral-600" : "text-neutral-400"}`} />
                  <span>UNIFIED INTERFACE</span>
                </div>
                <h2 className={`text-[clamp(34px,4.6vw,56px)] font-bold sm:font-semibold leading-[1.06] tracking-[-0.025em] ${isLight ? "text-neutral-900" : "text-white"}`}>
                  One interface for difficult imagery.
                </h2>
                <p className={`text-[16px] sm:text-[17.5px] leading-[1.65] ${isLight ? "text-neutral-600" : "text-neutral-300"} font-normal`}>
                  Satellite data is rich, but the path from image to answer is often fragmented
                  across specialist tools, GIS software, and multi-step manual workflows. SatQuery
                  brings those workflows into one conversational workspace.
                </p>
              </div>

              {/* Feature Cards Grid (Varied Layouts) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`tech-card rounded-2xl p-7 flex flex-col justify-between ${isLight ? "!bg-[#fcfbf8] !border-black/10 !shadow-md" : ""}`}>
                  <div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? "border-black/10 bg-black/5" : "border-white/15 bg-white/5"} mb-5`}>
                      <Sparkles className={`h-5 w-5 ${isLight ? "text-neutral-800" : "text-neutral-200"}`} />
                    </div>
                    <h3 className={`text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"} mb-2.5 tracking-tight`}>Ask your imagery</h3>
                    <p className={`text-[14.5px] leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"} font-normal`}>
                      Move from raw satellite imagery to natural-language answers without manually
                      translating every question into a remote-sensing workflow.
                    </p>
                  </div>
                  <div className={`mt-8 pt-4 border-t ${isLight ? "border-black/10 text-neutral-500" : "border-white/5 text-neutral-400"} font-mono text-[11px]`}>
                    CAPABILITY: VQA · CAPTIONING · GROUNDING
                  </div>
                </div>

                <div className={`tech-card rounded-2xl p-7 flex flex-col justify-between ${isLight ? "!bg-[#fcfbf8] !border-black/10 !shadow-md" : ""}`}>
                  <div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? "border-black/10 bg-black/5" : "border-white/15 bg-white/5"} mb-5`}>
                      <FileCheck className={`h-5 w-5 ${isLight ? "text-neutral-800" : "text-neutral-200"}`} />
                    </div>
                    <h3 className={`text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"} mb-2.5 tracking-tight`}>Evidence, not just answers</h3>
                    <p className={`text-[14.5px] leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"} font-normal`}>
                      Every analysis exposes its source imagery, detected regions, derived maps,
                      calibrated confidence, and observable execution path.
                    </p>
                  </div>
                  <div className={`mt-8 pt-4 border-t ${isLight ? "border-black/10 text-neutral-500" : "border-white/5 text-neutral-400"} font-mono text-[11px]`}>
                    EXPORT: GEOJSON (EPSG:4326) · REPORTLAB PDF
                  </div>
                </div>

                <div className={`tech-card rounded-2xl p-7 flex flex-col justify-between ${isLight ? "!bg-[#fcfbf8] !border-black/10 !shadow-md" : ""}`}>
                  <div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${isLight ? "border-black/10 bg-black/5" : "border-white/15 bg-white/5"} mb-5`}>
                      <Layers className={`h-5 w-5 ${isLight ? "text-neutral-800" : "text-neutral-200"}`} />
                    </div>
                    <h3 className={`text-xl font-semibold ${isLight ? "text-neutral-900" : "text-white"} mb-2.5 tracking-tight`}>One question. The right model.</h3>
                    <p className={`text-[14.5px] leading-relaxed ${isLight ? "text-neutral-600" : "text-neutral-300"} font-normal`}>
                      SatQuery routes different questions to specialist remote-sensing models rather
                      than forcing every task through a single generalist LLM.
                    </p>
                  </div>
                  <div className={`mt-8 pt-4 border-t ${isLight ? "border-black/10 text-neutral-500" : "border-white/5 text-neutral-400"} font-mono text-[11px]`}>
                    SPECIALISTS: GEOCHAT · PRITHVI · TERRAMIND
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Change Detection Showcase */}
          <ChangeShowcase />

          {/* Multimodal Optical + SAR Showcase */}
          <MultimodalShowcase />

          {/* Observable Agentic Pipeline Section */}
          <Workflow />

          {/* FAQ Luxury Inquiries Section */}
          <FAQ />
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
