import { ArrowRight, Cpu, Satellite } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { LiveModelRegistry } from "@/components/marketing/LiveModelRegistry";
import { LiveProviderStatus } from "@/components/marketing/LiveProviderStatus";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";

export const metadata = {
  title: "Models & Specialist Layer — SatQuery AI",
  description: "Specialist remote-sensing models orchestrated by SatQuery AI: SatQuery Agent, SatQuery Vision, SatQuery Earth, SatQuery Fusion, and SatQuery Change.",
};

export default function ModelsPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#080808] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />

        <main className="flex-1 pt-36 sm:pt-44 pb-28">
          <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-xs tracking-wider uppercase text-neutral-300">
                <Cpu className="h-3.5 w-3.5 text-neutral-400" />
                <span>MODEL REGISTRY & ORCHESTRATION</span>
              </div>
              <h1 className="text-[clamp(38px,5.2vw,62px)] font-bold sm:font-semibold leading-[1.08] tracking-tight text-white">
                Specialist models for specialized tasks.
              </h1>
              <p className="text-[18px] sm:text-[19px] leading-relaxed text-neutral-200 font-normal">
                Earth observation data is too complex for a single generalist model. SatQuery
                orchestrates domain-adapted specialist models, strictly routing queries according to
                sensor modalities and verified task policies.
              </p>
            </div>

            {/* Model Cards -- live status fetched from the real model registry
                and per-model health check, not hardcoded copy */}
            <LiveModelRegistry />

            {/* Satellite Data Providers -- live status from the real
                provider-manager health check, not a static claim */}
            <div className="mt-20 mb-8 flex items-center gap-2.5">
              <Satellite className="h-4.5 w-4.5 text-neutral-300" />
              <h2 className="font-mono text-xs sm:text-sm uppercase tracking-wider text-neutral-200 font-semibold">
                Satellite Data Providers
              </h2>
            </div>
            <LiveProviderStatus />

            {/* Integrity Disclosure Alert */}
            <div className="mt-12 rounded-2xl border border-white/10 bg-[#0d0d0d] p-7 space-y-2.5">
              <div className="text-white uppercase font-semibold font-mono text-sm tracking-wider">
                Integrity & Policy Guarantee
              </div>
              <p className="text-sm sm:text-[14.5px] leading-relaxed text-neutral-300 font-normal font-sans">
                SatQuery strictly reports model provenance with each response. When running in demonstration
                or lightweight mode without GPU weights, results are deterministically labeled as mock
                heuristic executions, and confidence reports reflect transparent, un-fabricated scores.
              </p>
            </div>

            {/* Bottom CTA */}
            <div className="mt-14 text-center">
              <Link
                href="/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm sm:text-base font-semibold text-black hover:bg-neutral-200 transition-all shadow-lg hover:shadow-white/10"
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
