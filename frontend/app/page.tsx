import Link from "next/link";
import { ArrowRight, Compass, FileCheck, Layers, Sparkles } from "lucide-react";
import AirlockHero from "@/components/marketing/AirlockHero";
import { ChangeShowcase } from "@/components/marketing/ChangeShowcase";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { MultimodalShowcase } from "@/components/marketing/MultimodalShowcase";
import { Navbar } from "@/components/marketing/Navbar";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { Workflow } from "@/components/marketing/Workflow";

export default function HomePage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />

        <main className="flex-1">
          {/* Airlock Interactive Scroll-Locked Video Hero */}
          <AirlockHero />

          {/* Hero Section */}
          <Hero />

          {/* Product Preview Section */}
          <ProductPreview />

          {/* Editorial Section: One interface for difficult imagery */}
          <section className="py-24 border-t border-white/10 bg-[#0a0a0a]" id="features">
            <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
              <div className="max-w-3xl mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] tracking-wider uppercase text-neutral-300">
                  <Compass className="h-3 w-3 text-neutral-400" />
                  <span>UNIFIED INTERFACE</span>
                </div>
                <h2 className="text-[clamp(30px,4vw,48px)] font-medium leading-[1.08] tracking-tight text-white">
                  One interface for difficult imagery.
                </h2>
                <p className="text-[16px] leading-relaxed text-neutral-400">
                  Satellite data is rich, but the path from image to answer is often fragmented
                  across specialist tools, GIS software, and multi-step manual workflows. SatQuery
                  brings those workflows into one conversational workspace.
                </p>
              </div>

              {/* Feature Cards Grid (Varied Layouts) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="tech-card rounded-2xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
                      <Sparkles className="h-5 w-5 text-neutral-200" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 tracking-tight">Ask your imagery</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      Move from raw satellite imagery to natural-language answers without manually
                      translating every question into a remote-sensing workflow.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[11px] text-neutral-400">
                    CAPABILITY: VQA · CAPTIONING · GROUNDING
                  </div>
                </div>

                <div className="tech-card rounded-2xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
                      <FileCheck className="h-5 w-5 text-neutral-200" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 tracking-tight">Evidence, not just answers</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      Every analysis exposes its source imagery, detected regions, derived maps,
                      calibrated confidence, and observable execution path.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[11px] text-neutral-400">
                    EXPORT: GEOJSON (EPSG:4326) · REPORTLAB PDF
                  </div>
                </div>

                <div className="tech-card rounded-2xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 mb-5">
                      <Layers className="h-5 w-5 text-neutral-200" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2 tracking-tight">One question. The right model.</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      SatQuery routes different questions to specialist remote-sensing models rather
                      than forcing every task through a single generalist LLM.
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[11px] text-neutral-400">
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

          {/* Final Call To Action */}
          <section className="py-24 border-t border-white/10 bg-[#0a0a0a] text-center">
            <div className="max-w-2xl mx-auto px-6 space-y-6">
              <h2 className="text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.06] tracking-tightest text-white">
                Start analyzing Earth observation data.
              </h2>
              <p className="text-[16px] text-neutral-400 max-w-lg mx-auto leading-relaxed">
                Upload your GeoTIFF or explore synthetic demo scenes. SatQuery identifies modalities,
                orchestrates specialists, and proves each answer with evidence.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/app"
                  className="group flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-medium text-black transition-all hover:bg-neutral-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                >
                  <span>Launch SatQuery AI</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/models"
                  className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Inspect Model Registry
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
