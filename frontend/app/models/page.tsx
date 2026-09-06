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

            {/* Model Cards -- live status fetched from the real model registry
                and per-model health check, not hardcoded copy */}
            <LiveModelRegistry />

            {/* Satellite Data Providers -- live status from the real
                provider-manager health check, not a static claim */}
            <div className="mt-20 mb-8 flex items-center gap-2">
              <Satellite className="h-4 w-4 text-neutral-400" />
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-300">
                Satellite Data Providers
              </h2>
            </div>
            <LiveProviderStatus />

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
