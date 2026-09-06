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

        <main className="flex-1 pt-36 sm:pt-44 pb-28">
          <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-xs tracking-wider uppercase text-neutral-300">
                <Globe2 className="h-3.5 w-3.5 text-neutral-400" />
                <span>MISSION & PHILOSOPHY</span>
              </div>
              <h1 className="text-[clamp(38px,5.2vw,62px)] font-bold sm:font-semibold leading-[1.08] tracking-tight text-white">
                An interface for Earth observation.
              </h1>
              <p className="text-[20px] sm:text-[21px] leading-[1.65] text-neutral-200 font-normal">
                Satellite imagery contains enormous amounts of information, but extracting useful
                answers has historically required specialized GIS software, remote-sensing
                domain expertise, and multi-step manual processing pipelines.
              </p>
            </div>

            {/* Narrative Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-white/10 pt-12">
              <div className="md:col-span-4 font-mono text-xs text-neutral-400 uppercase tracking-wider space-y-2">
                <div className="font-semibold tracking-widest text-neutral-400">FOUNDATIONAL PRINCIPLE</div>
                <div className="text-white text-lg sm:text-xl font-semibold font-sans normal-case leading-snug">
                  Imagery should be queried, not merely viewed.
                </div>
              </div>

              <div className="md:col-span-8 space-y-6 text-[16.5px] sm:text-[17.5px] leading-[1.7] text-neutral-200 font-normal">
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
                <p className="text-white font-medium text-lg pt-2">
                  The system brings together six core capabilities under one orchestrator:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="tech-card rounded-2xl p-5 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all space-y-1.5">
                    <div className="text-white font-semibold text-[15px] sm:text-[15.5px] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                      <span>Vision-Language Understanding</span>
                    </div>
                    <div className="text-neutral-300 text-[13.5px] sm:text-[14px] leading-relaxed pl-3.5">
                      Natural-language VQA, grounding, and captions.
                    </div>
                  </div>

                  <div className="tech-card rounded-2xl p-5 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all space-y-1.5">
                    <div className="text-white font-semibold text-[15px] sm:text-[15.5px] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                      <span>Bi-Temporal Change Detection</span>
                    </div>
                    <div className="text-neutral-300 text-[13.5px] sm:text-[14px] leading-relaxed pl-3.5">
                      Pixel differencing and metric area calculation.
                    </div>
                  </div>

                  <div className="tech-card rounded-2xl p-5 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all space-y-1.5">
                    <div className="text-white font-semibold text-[15px] sm:text-[15.5px] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                      <span>Multispectral Representation</span>
                    </div>
                    <div className="text-neutral-300 text-[13.5px] sm:text-[14px] leading-relaxed pl-3.5">
                      Embeddings across vegetation, soil, and water bands.
                    </div>
                  </div>

                  <div className="tech-card rounded-2xl p-5 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all space-y-1.5">
                    <div className="text-white font-semibold text-[15px] sm:text-[15.5px] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                      <span>Optical-SAR Multimodal Fusion</span>
                    </div>
                    <div className="text-neutral-300 text-[13.5px] sm:text-[14px] leading-relaxed pl-3.5">
                      All-weather radar verification of ground structures.
                    </div>
                  </div>

                  <div className="tech-card rounded-2xl p-5 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all space-y-1.5">
                    <div className="text-white font-semibold text-[15px] sm:text-[15.5px] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                      <span>Grounded Evidence Generation</span>
                    </div>
                    <div className="text-neutral-300 text-[13.5px] sm:text-[14px] leading-relaxed pl-3.5">
                      Bounding boxes and masks reprojected to EPSG:4326.
                    </div>
                  </div>

                  <div className="tech-card rounded-2xl p-5 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all space-y-1.5">
                    <div className="text-white font-semibold text-[15px] sm:text-[15.5px] flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/90 shrink-0" />
                      <span>Geospatial Scene Retrieval</span>
                    </div>
                    <div className="text-neutral-300 text-[13.5px] sm:text-[14px] leading-relaxed pl-3.5">
                      Candidate ranking from Copernicus and USGS catalogues.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Statement */}
            <div className="mt-16 rounded-2xl border border-white/10 bg-[#0c0c0c] p-8 md:p-10 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Trust, Transparency, and Provenance</h2>
              <p className="text-[15.5px] sm:text-[16.5px] leading-relaxed text-neutral-200 max-w-3xl font-normal">
                Unlike consumer chatbots that generate plausible text without accountability, SatQuery
                is built around verifiable evidence. When an answer is delivered, you can inspect the
                original sensor scene ID, the affine transform CRS used, the processing steps applied,
                and the individual model responsible.
              </p>
              <div className="pt-3">
                <Link
                  href="/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm sm:text-base font-semibold text-black hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/10"
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
