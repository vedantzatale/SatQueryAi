"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, Brain, Lightbulb, Mic, Plus } from "lucide-react";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"decision" | "spatial">("spatial");

  return (
    <div className="w-full bg-[#0c0c0c] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden antialiased">
      <style jsx global>{`
        :root {
          --hero-bg: #0c0c0c;
          --hero-box: #111111;
          --hero-hairline: rgba(255, 255, 255, 0.065);
          --hero-heading: #fafafa;
          --hero-subtitle: #9e9e9e;
          --hero-nav: #bcbcbc;
          --hero-placeholder: #aeaeae;
          --hero-chip-fill: rgba(255, 255, 255, 0.028);
          --hero-chip-border: rgba(255, 255, 255, 0.3);
          --hero-chip-edge: linear-gradient(
            135deg,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.94) 22%,
            rgba(255, 255, 255, 0.44) 38%,
            rgba(255, 255, 255, 0.28) 50%,
            rgba(255, 255, 255, 0.11) 63%,
            rgba(255, 255, 255, 0.04) 75%,
            rgba(255, 255, 255, 0.02) 100%
          );
          --hero-grad-solid: linear-gradient(
            90deg,
            #ffe776 0%,
            #ffd400 22%,
            #ffd000 40%,
            #c9c93c 60%,
            #86ca8a 76%,
            #78d0cd 100%
          );
          --hero-grad: linear-gradient(
            90deg,
            rgba(255, 232, 120, 0) 0%,
            #ffe776 6%,
            #ffd400 26%,
            #ffd000 42%,
            #c9c93c 60%,
            #86ca8a 74%,
            #78d0cd 88%,
            rgba(120, 208, 205, 0.55) 100%
          );
        }

        @keyframes send-ring-sweep {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-ring-sweep {
          animation: send-ring-sweep 10s linear infinite;
        }

        .chip-edge-ring {
          position: relative;
        }
        .chip-edge-ring::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: var(--hero-chip-edge);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .panel-gradient-bg {
          background: radial-gradient(120% 150% at 9% 52%, #d2ae1a 0%, #bf9f28 22%, rgba(175, 155, 55, 0) 56%),
            radial-gradient(120% 150% at 95% 50%, #64a3a2 0%, #4d9494 34%, rgba(70, 140, 140, 0) 64%),
            radial-gradient(80% 110% at 42% 6%, rgba(150, 160, 55, 0.55) 0%, rgba(150, 160, 60, 0) 42%),
            linear-gradient(96deg, #c6a119 0%, #b0972a 32%, #7ba184 62%, #509393 100%);
        }

        .panel-vignette::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(135% 120% at 50% 50%, transparent 58%, rgba(0, 0, 0, 0.3) 100%);
          pointer-events: none;
        }
      `}</style>

      {/* ════════════════════════════════════
          SECTION 1 — HERO (#home)
      ════════════════════════════════════ */}
      <section
        id="home"
        className="section-one relative min-h-[92vh] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 md:px-8 max-w-[1240px] mx-auto"
      >
        {/* Centered Hero Headline & Subtitle */}
        <div className="flex flex-col items-center text-center mt-6 sm:mt-10">
          <h1 className="text-[clamp(2.25rem,5.2vw,5.5rem)] font-medium leading-[1.04] tracking-[-0.021em] text-[#fafafa] max-w-4xl">
            <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
              <span className="inline-block">Think clearly.</span>
            </span>
            <span className="block overflow-hidden pb-[0.16em] -mb-[0.16em]">
              <span className="inline-block">Decide confidently.</span>
            </span>
          </h1>

          <p className="mt-[clamp(1.1rem,2.5vw,2.5rem)] max-w-xl text-[clamp(0.95rem,1.4vw,1.4rem)] leading-[1.35] text-[#9e9e9e] font-normal tracking-[0.004em]">
            An AI workspace that structures your reasoning,
            <br className="hidden sm:inline" /> not just your answers.
          </p>

          {/* Quick CTA row */}
          <div className="mt-7 flex items-center gap-3">
            <Link
              href="/app"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs sm:text-sm font-medium text-[#0c0c0c] hover:bg-[#ededed] active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(255,255,255,0.15)]"
            >
              <span>Start Free</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-xs sm:text-sm font-normal text-neutral-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all"
            >
              Explore features
            </a>
          </div>
        </div>

        {/* COMPOSER CARD (Hero Interactive Element) */}
        <div className="composer-shell w-full flex justify-center mt-[clamp(1.8rem,3.2vw,3.2rem)] relative z-10">
          <div className="composer relative w-full max-w-[860px] min-h-[190px] sm:min-h-[220px] rounded-[clamp(16px,1.5vw,22px)] border border-white/[0.065] bg-[#111111] bg-gradient-to-b from-white/[0.028] via-transparent to-transparent p-[clamp(16px,2vw,30px)] flex flex-col justify-between shadow-[0_2px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
            {/* Yellow-to-Teal Underglow hugging bottom edge */}
            <div
              className="composer-glow absolute inset-x-0 -bottom-[3px] sm:-bottom-[5px] h-3 rounded-b-[inherit] -z-10 opacity-95 blur-[1px] pointer-events-none"
              style={{ background: "var(--hero-grad-solid)" }}
            />

            {/* Placeholder Text */}
            <div className="text-[#aeaeae] text-[clamp(1rem,1.35vw,1.35rem)] font-normal select-none">
              Break down a satellite scene, AOI change, or raster query…
            </div>

            {/* Controls Row */}
            <div className="mt-8 flex items-center gap-[clamp(8px,1vw,16px)]">
              {/* Plus Button */}
              <Link
                href="/app"
                className="chip-edge-ring flex h-[clamp(38px,3.2vw,48px)] w-[clamp(38px,3.2vw,48px)] shrink-0 items-center justify-center rounded-full bg-white/[0.028] text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Add attachment"
                title="Add attachment"
              >
                <Plus className="h-4 w-4 stroke-[2]" />
              </Link>

              {/* DeepThink Pill Chip */}
              <button
                type="button"
                className="chip-edge-ring flex h-[clamp(38px,3.2vw,48px)] items-center gap-2 rounded-full bg-white/[0.028] px-[clamp(12px,1.4vw,22px)] text-xs sm:text-[13px] font-normal text-white hover:bg-white/[0.08] transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
                <span>DeepThink</span>
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Mic Icon */}
              <button
                type="button"
                className="flex h-[clamp(38px,3.2vw,48px)] w-[clamp(38px,3.2vw,48px)] items-center justify-center rounded-full text-[#e1e1e1] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Voice query"
                title="Voice query"
              >
                <Mic className="h-4 w-4" />
              </button>

              {/* Send Button with Rotating Rainbow/Gradient Ring */}
              <Link
                href="/app"
                className="relative flex h-[clamp(40px,3.35vw,52px)] w-[clamp(40px,3.35vw,52px)] shrink-0 items-center justify-center rounded-full p-[1.5px] hover:brightness-110 active:scale-95 transition-transform overflow-hidden group"
                aria-label="Send query"
                title="Send query"
              >
                {/* Rotating Gradient Ring Layer */}
                <div
                  className="absolute inset-[-100%] animate-ring-sweep opacity-100"
                  style={{ background: "var(--hero-grad-solid)" }}
                />
                {/* Inner Disc with Up-Arrow */}
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#141414] text-[#fafafa] z-10">
                  <ArrowUp className="h-4 w-4 stroke-[2.4]" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* TRUST LOGOS FOOTER */}
        <div className="mt-14 sm:mt-20 pt-6 border-t border-white/[0.05] flex flex-wrap items-center justify-center gap-[clamp(1.8rem,5vw,5.5rem)] text-[#5c5c5c]">
          {/* Brand 1 */}
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum</span>
          </div>

          {/* Brand 2 */}
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="3" fill="currentColor" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">
              logoipsum<sup className="text-[8px] ml-0.5">®</sup>
            </span>
          </div>

          {/* Brand 3 */}
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M9 9h6v6H9z" fill="currentColor" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum</span>
          </div>

          {/* Brand 4 */}
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <polygon points="12 2 22 12 12 22 2 12" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
            <span className="font-semibold text-xs tracking-wider uppercase">logoipsum</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          SECTION 2 — FEATURES (#features)
      ════════════════════════════════════ */}
      <section
        id="features"
        className="section-two relative min-h-[100dvh] bg-[#0c0c0c] pt-[clamp(70px,10vw,160px)] pb-[clamp(30px,4vh,60px)] px-4 sm:px-6 md:px-8 max-w-[1300px] mx-auto flex flex-col justify-between"
      >
        {/* Section 2 Header */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <h2 className="text-[clamp(1.8rem,4.1vw,3.3rem)] font-normal leading-[1.11] tracking-[-0.02em] text-[#ffffff]">
            <span className="block">Built for Earth intelligence.</span>
            <span className="block text-neutral-300">Powered by structured spatial models.</span>
          </h2>
          <p className="mt-4 text-[clamp(0.85rem,1.25vw,1.125rem)] text-[#8b8b8d] leading-relaxed">
            Ask complex geospatial questions. Explore multi-sensor perspectives.
            <br className="hidden sm:inline" /> Get structured, reliable answers — instantly.
          </p>
        </div>

        {/* EXACT MULTI-LAYER GRADIENT PANEL */}
        <div className="panel relative w-full rounded-[clamp(14px,1.4vw,22px)] panel-gradient-bg panel-vignette p-[clamp(16px,2.2vw,36px)] shadow-2xl overflow-hidden">
          {/* Live Reasoning Pill */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-3.5 py-1 text-xs font-medium text-[#0b0c07] border border-black/10">
              <span className="h-2 w-2 rounded-full bg-[#23d92c] shadow-[0_0_8px_rgba(45,220,55,0.8)] animate-pulse" />
              <span className="text-white font-mono text-[11px] tracking-wide">Live spatial reasoning</span>
            </div>

            <Link
              href="/app"
              className="text-xs font-mono text-black/80 hover:text-black font-semibold bg-white/30 backdrop-blur-md hover:bg-white/50 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
            >
              <span>Open live workspace</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Inner Dark Chat Card */}
          <div className="chat-card max-w-[840px] mx-auto rounded-[clamp(14px,1.4vw,20px)] bg-[#0d0d0d] border border-white/10 p-[clamp(16px,2vw,28px)] shadow-2xl space-y-4 font-sans">
            {/* Message 1: User */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="max-w-[80%] rounded-[15px] bg-[#1c1c1c] text-[#efefef] px-4 py-2.5 text-[clamp(0.85rem,1.1vw,1.05rem)] leading-[1.42] shadow-sm">
                What changed between these two Sentinel-2 images of northern Pune?
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-neutral-200">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Message 2: AI */}
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm"
                style={{
                  background: "linear-gradient(105deg,#f5c40a 0%,#dcae3f 40%,#6ac6a0 62%,#22c0cf 100%)",
                }}
              >
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_4px_white]" />
              </div>
              <div className="max-w-[82%] rounded-[15px] bg-[#1c1c1c] text-[#efefef] px-4 py-3 text-[clamp(0.85rem,1.1vw,1.05rem)] leading-[1.42] shadow-sm space-y-2">
                <p>Let&#39;s evaluate the spectral change across four spatial dimensions:</p>
                <ul className="space-y-1 pl-1 text-neutral-300">
                  <li>• Built-up urban expansion (+12.4 ha)</li>
                  <li>• Agricultural plot conversion</li>
                  <li>• Vegetation canopy index (NDVI)</li>
                  <li>• Surface moisture &amp; runoff (NDWI)</li>
                </ul>
                <p className="pt-1 text-white font-medium">Would you like to prioritize SAR radar or optical multispectral evidence?</p>
              </div>
            </div>

            {/* Message 3: User */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="max-w-[80%] rounded-[15px] bg-[#1c1c1c] text-[#efefef] px-4 py-2.5 text-[clamp(0.85rem,1.1vw,1.05rem)] leading-[1.42] shadow-sm">
                Analyze the Mumbai coastal SAR data. Did flood inundation rise in August?
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-neutral-200">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Message 4: AI */}
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm"
                style={{
                  background: "linear-gradient(105deg,#f5c40a 0%,#dcae3f 40%,#6ac6a0 62%,#22c0cf 100%)",
                }}
              >
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_4px_white]" />
              </div>
              <div className="max-w-[82%] rounded-[15px] bg-[#1c1c1c] text-[#efefef] px-4 py-3 text-[clamp(0.85rem,1.1vw,1.05rem)] leading-[1.42] shadow-sm">
                I&#39;ve coregistered the Sentinel-1 C-SAR pass. The flood extent in August increased by 14.2 hectares across low-lying estuaries. I&#39;ve drafted a calibrated change report below.
              </div>
            </div>

            {/* Message 5: User (Final) */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="max-w-[80%] rounded-[15px] bg-[#1c1c1c] text-[#efefef] px-4 py-2.5 text-[clamp(0.85rem,1.1vw,1.05rem)] leading-[1.42] shadow-sm">
                Quantify deforestation across Sector 4B and export a GeoJSON polygon mask for GIS
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-neutral-200">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            {/* Bottom White Pill Input Bar */}
            <div className="pt-2">
              <Link
                href="/app"
                className="flex items-center justify-between rounded-full bg-[#fdfdfd] px-4 py-2 sm:py-2.5 shadow-md hover:bg-white transition-colors cursor-text text-left"
              >
                <span className="text-[#6b6b6d] text-xs sm:text-sm font-normal">Ask a question about the satellite imagery…</span>
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#111111]" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0c0c0c] text-white">
                    <ArrowUp className="h-3 w-3 stroke-[2.5]" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
