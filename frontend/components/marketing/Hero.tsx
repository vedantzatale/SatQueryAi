"use client";

import Link from "next/link";
import { ArrowRight, Crosshair, Layers, MapPin, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section id="overview" className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 overflow-hidden bg-tech-grid">
      {/* Background ambient radial gradients (Monochrome white/neutral, NO blue/purple) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[600px] w-[850px] -translate-x-1/2 rounded-full opacity-40"
          style={{
            background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#080808] to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-[1140px] px-6 sm:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-[11px] font-mono tracking-widest uppercase text-neutral-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>REMOTE-SENSING INTELLIGENCE</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="mx-auto max-w-4xl text-[clamp(40px,6vw,72px)] font-medium leading-[1.04] tracking-tightest text-neutral-100 font-sans">
          Talk to satellite imagery.
        </h1>

        {/* Supporting Copy */}
        <p className="mx-auto mt-6 max-w-2xl text-[16px] sm:text-[17px] leading-relaxed text-neutral-400 font-normal">
          Ask natural-language questions about Earth observation data, compare imagery across
          time, inspect regions, and turn complex remote-sensing workflows into a conversation.
        </p>

        {/* Action CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/app"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-medium text-black transition-all duration-200 hover:bg-neutral-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
          >
            <span>Try SatQuery AI</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#features"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.02] px-6 py-3 text-[14px] font-medium text-neutral-300 transition-all duration-200 hover:border-white/30 hover:bg-white/[0.05] hover:text-white"
          >
            Explore the platform
          </a>
        </div>

        {/* Technical Earth Observation Telemetry Strip */}
        <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl border border-white/10 bg-[#0d0d0d]/80 px-4 py-2 font-mono text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Crosshair className="h-3 w-3 text-neutral-400" />
            <span>AOI: 18.5204° N, 73.8567° E</span>
          </div>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3 text-neutral-400" />
            <span>MODALITIES: OPTICAL + SAR + MSI</span>
          </div>
          <span className="hidden sm:inline text-neutral-600">•</span>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-neutral-400" />
            <span>CRS: EPSG:4326 · 10M GSD</span>
          </div>
        </div>
      </div>
    </section>
  );
}
