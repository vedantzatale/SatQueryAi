"use client";

import { ArrowRight, Cpu, Satellite } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { LiveModelRegistry } from "@/components/marketing/LiveModelRegistry";
import { LiveProviderStatus } from "@/components/marketing/LiveProviderStatus";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { useTheme } from "@/lib/theme";

export function ModelsContent() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <SmoothScroll>
      <div
        className={`min-h-screen ${
          isLight ? "bg-[#f5f2eb] text-[#18181b]" : "bg-[#080808] text-neutral-100"
        } flex flex-col font-sans selection:bg-white selection:text-black transition-colors duration-200`}
      >
        <Navbar />

        <main className="flex-1 pt-36 sm:pt-44 pb-28">
          <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs tracking-wider uppercase ${
                  isLight
                    ? "border-black/10 bg-black/5 text-neutral-700"
                    : "border-white/10 bg-white/[0.04] text-neutral-300"
                }`}
              >
                <Cpu className={`h-3.5 w-3.5 ${isLight ? "text-neutral-600" : "text-neutral-400"}`} />
                <span>MODEL REGISTRY & ORCHESTRATION</span>
              </div>
              <h1
                className={`text-[clamp(38px,5.2vw,62px)] font-bold sm:font-semibold leading-[1.08] tracking-tight ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                Specialist models for specialized tasks.
              </h1>
              <p
                className={`text-[18px] sm:text-[19px] leading-relaxed font-normal ${
                  isLight ? "text-neutral-600" : "text-neutral-200"
                }`}
              >
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
              <Satellite className={`h-4.5 w-4.5 ${isLight ? "text-neutral-700" : "text-neutral-300"}`} />
              <h2
                className={`font-mono text-xs sm:text-sm uppercase tracking-wider font-semibold ${
                  isLight ? "text-neutral-900" : "text-neutral-200"
                }`}
              >
                Satellite Data Providers
              </h2>
            </div>
            <LiveProviderStatus />

            {/* Integrity Disclosure Alert */}
            <div
              className={`mt-12 rounded-2xl border p-7 space-y-2.5 ${
                isLight ? "border-black/10 bg-[#fcfbf8] shadow-sm" : "border-white/10 bg-[#0d0d0d]"
              }`}
            >
              <div
                className={`uppercase font-semibold font-mono text-sm tracking-wider ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                Integrity & Policy Guarantee
              </div>
              <p
                className={`text-sm sm:text-[14.5px] leading-relaxed font-normal font-sans ${
                  isLight ? "text-neutral-600" : "text-neutral-300"
                }`}
              >
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
                className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm sm:text-base font-semibold transition-all shadow-lg ${
                  isLight
                    ? "bg-[#18181b] text-white hover:bg-black shadow-black/10 hover:shadow-black/20"
                    : "bg-white text-black hover:bg-neutral-200 hover:shadow-white/10"
                }`}
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
