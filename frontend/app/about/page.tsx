import Link from "next/link";
import { ArrowRight, Compass, Globe2, Layers, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";

export const metadata = {
  title: "About — SatQuery AI",
  description: "An interface for Earth observation. Turning complex remote sensing workflows into grounded conversational intelligence.",
};

export default function AboutPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />

        <main className="flex-1 pt-32 pb-24">
          <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 font-mono text-[11px] tracking-wider uppercase text-neutral-300">
                <Globe2 className="h-3 w-3 text-neutral-400" />
                <span>MISSION & PHILOSOPHY</span>
              </div>
              <h1 className="text-[clamp(36px,5vw,60px)] font-medium leading-[1.05] tracking-tight text-white">
                An interface for Earth observation.
              </h1>
              <p className="text-[19px] leading-relaxed text-neutral-300 font-normal">
                Satellite imagery contains enormous amounts of information, but extracting useful
                answers has historically required specialized GIS software, remote-sensing
                domain expertise, and multi-step manual processing pipelines.
              </p>
            </div>

            {/* Narrative Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/10 pt-12">
              <div className="md:col-span-4 font-mono text-xs text-neutral-400 uppercase tracking-wider space-y-1">
                <div>FOUNDATIONAL PRINCIPLE</div>
                <div className="text-white text-sm font-sans normal-case">
                  Imagery should be queried, not merely viewed.
                </div>
              </div>

              <div className="md:col-span-8 space-y-6 text-[15px] leading-relaxed text-neutral-400">
                <p>
                  SatQuery AI is designed around a simple idea: satellite imagery should be
                  something people can ask questions about, not merely something they inspect
                  through layers on a map viewer.
                </p>
                <p>
                  By combining conversational interaction with specialist remote-sensing models,
                  SatQuery turns complex analysis workflows into an accessible workspace while
                  keeping evidence and visual context close to every answer.
                </p>
                <p>The system brings together six core capabilities under one orchestrator:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="tech-card rounded-xl p-4 font-mono text-xs">
                    <div className="text-white font-medium mb-1">• Vision-Language Understanding</div>
                    <div className="text-neutral-400">Natural-language VQA, grounding, and captions.</div>
                  </div>
                  <div className="tech-card rounded-xl p-4 font-mono text-xs">
                    <div className="text-white font-medium mb-1">• Bi-Temporal Change Detection</div>
                    <div className="text-neutral-400">Pixel differencing and metric area calculation.</div>
                  </div>
                  <div className="tech-card rounded-xl p-4 font-mono text-xs">
                    <div className="text-white font-medium mb-1">• Multispectral Representation</div>
                    <div className="text-neutral-400">Embeddings across vegetation, soil, and water bands.</div>
                  </div>
                  <div className="tech-card rounded-xl p-4 font-mono text-xs">
                    <div className="text-white font-medium mb-1">• Optical-SAR Multimodal Fusion</div>
                    <div className="text-neutral-400">All-weather radar verification of ground structures.</div>
                  </div>
                  <div className="tech-card rounded-xl p-4 font-mono text-xs">
                    <div className="text-white font-medium mb-1">• Grounded Evidence Generation</div>
                    <div className="text-neutral-400">Bounding boxes and masks reprojected to EPSG:4326.</div>
                  </div>
                  <div className="tech-card rounded-xl p-4 font-mono text-xs">
                    <div className="text-white font-medium mb-1">• Geospatial Scene Retrieval</div>
                    <div className="text-neutral-400">Candidate ranking from Copernicus and USGS catalogues.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Statement */}
            <div className="mt-16 rounded-2xl border border-white/10 bg-[#0c0c0c] p-8 md:p-10 space-y-4">
              <h2 className="text-xl font-medium text-white">Trust, Transparency, and Provenance</h2>
              <p className="text-sm leading-relaxed text-neutral-400 max-w-3xl">
                Unlike consumer chatbots that generate plausible text without accountability, SatQuery
                is built around verifiable evidence. When an answer is delivered, you can inspect the
                original sensor scene ID, the affine transform CRS used, the processing steps applied,
                and the individual model responsible.
              </p>
              <div className="pt-2">
                <Link
                  href="/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-neutral-200 transition-colors"
                >
                  <span>Explore in SatQuery AI</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
