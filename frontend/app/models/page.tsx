import Link from "next/link";
import { ArrowRight, Cpu, Layers, Network, Shield, Sparkles } from "lucide-react";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";

export const metadata = {
  title: "Models & Specialist Layer — SatQuery AI",
  description: "Specialist remote-sensing models orchestrated by SatQuery AI: SatQuery Agent, SatQuery Vision, SatQuery Earth, SatQuery Fusion, and SatQuery Change.",
};

export default function ModelsPage() {
  const models = [
    {
      name: "SATQUERY AGENT",
      tag: "Orchestration & Task Planning",
      role: "Natural-language query understanding, multilingual intent parsing (English, Hindi, Hinglish), spatial coordinate extraction, and deterministic task routing.",
      underlying: "Adapted Qwen3 agent pipeline with strict schema enforcement.",
      status: "Active",
      fallback: "Rule-based keyword parser",
    },
    {
      name: "SATQUERY VISION",
      tag: "Remote-Sensing VQA & Grounding",
      role: "Answers natural-language visual questions, generates descriptive captions, and predicts bounding boxes for identified ground features.",
      underlying: "Domain-adapted vision-language architecture based on GeoChat-7B.",
      status: "Active",
      fallback: "HSV spectral segmentation contour grounding",
    },
    {
      name: "SATQUERY EARTH",
      tag: "Multispectral Representation",
      role: "Extracts dense geospatial embeddings and multispectral signatures across 6-12 spectral bands (NIR, SWIR, RedEdge).",
      underlying: "Specialist foundation model layer built around Prithvi-EO-2.0.",
      status: "Active",
      fallback: "Spectral band statistics & index transforms",
    },
    {
      name: "SATQUERY FUSION",
      tag: "Optical + SAR Multimodal Analysis",
      role: "Jointly reasons over optical multispectral imagery and synthetic aperture radar (SAR) backscatter, enabling cloud-penetrating verification of surface structures.",
      underlying: "Multimodal EO architecture built around TerraMind 1.0 & cross-attention encoders.",
      status: "Active",
      fallback: "Optical brightness + SAR backscatter cross-check",
    },
    {
      name: "SATQUERY CHANGE",
      tag: "Bi-Temporal Change Detection",
      role: "Identifies land-cover and structural transformations between paired satellite acquisitions, generates binary change masks, and calculates altered surface area.",
      underlying: "Bi-temporal transformer architecture based on ChangeFormer v2.",
      status: "Active",
      fallback: "Otsu thresholding + morphological differencing",
    },
  ];

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />

        <main className="flex-1 pt-32 pb-24">
          <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] tracking-wider uppercase text-neutral-300">
                <Cpu className="h-3 w-3 text-neutral-400" />
                <span>MODEL REGISTRY & ORCHESTRATION</span>
              </div>
              <h1 className="text-[clamp(36px,5vw,60px)] font-medium leading-[1.05] tracking-tight text-white">
                Specialist models for specialized tasks.
              </h1>
              <p className="text-[17px] leading-relaxed text-neutral-400">
                Earth observation data is too complex for a single generalist model. SatQuery
                orchestrates domain-adapted specialist models, strictly routing queries according to
                sensor modalities and verified task policies.
              </p>
            </div>

            {/* Model Cards */}
            <div className="space-y-4">
              {models.map((model, idx) => (
                <div
                  key={idx}
                  className="tech-card rounded-2xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-mono text-base font-semibold tracking-wide text-white">
                        {model.name}
                      </h2>
                      <span className="font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                        {model.tag}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed">{model.role}</p>
                    <div className="font-mono text-xs text-neutral-400">
                      Technology: <span className="text-neutral-300">{model.underlying}</span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-start md:items-end justify-between border-t md:border-t-0 border-white/10 pt-4 md:pt-0 font-mono text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{model.status}</span>
                    </div>
                    <div className="mt-1 text-neutral-400 text-[10px]">
                      Fallback: {model.fallback}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Integrity Disclosure Alert */}
            <div className="mt-12 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 font-mono text-xs text-neutral-400 space-y-2">
              <div className="text-neutral-200 uppercase font-semibold">Integrity & Policy Guarantee</div>
              <p className="leading-relaxed">
                SatQuery strictly reports model provenance with each response. When running in demonstration
                or lightweight mode without GPU weights, results are deterministically labeled as mock
                heuristic executions, and confidence reports reflect transparent, un-fabricated scores.
              </p>
            </div>

            {/* Bottom CTA */}
            <div className="mt-14 text-center">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-black hover:bg-neutral-200 transition-colors"
              >
                <span>Test models in live workspace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
