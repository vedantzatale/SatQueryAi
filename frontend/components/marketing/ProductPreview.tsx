"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Layers,
  MapPin,
  MessageSquare,
  Plus,
  Sliders,
  Sparkles,
} from "lucide-react";

export function ProductPreview() {
  const [traceOpen, setTraceOpen] = useState(true);

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-8 pb-20">
      <div className="rounded-2xl border border-white/15 bg-[#0e0e0e] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Window Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#121212] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-3 font-mono text-[11px] text-neutral-400">
              satquery-workspace // session-pune-growth
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
              ORCHESTRATOR ACTIVE
            </span>
            <Link
              href="/app"
              className="text-[12px] font-medium text-neutral-300 hover:text-white flex items-center gap-1"
            >
              <span>Open live workspace</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Application Layout: Sidebar + Conversation + Evidence */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px] bg-[#090909]">
          {/* Simulated Sidebar */}
          <div className="hidden md:flex md:col-span-3 flex-col border-r border-white/10 bg-[#0d0d0d] p-3">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-neutral-300">
              <span className="font-medium">+ New Analysis</span>
              <kbd className="font-mono text-[10px] text-neutral-400">⌘K</kbd>
            </div>

            <div className="mt-4 flex-1 space-y-4 text-[12px]">
              <div>
                <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  Today
                </div>
                <div className="rounded-md bg-white/[0.08] px-2.5 py-1.5 font-medium text-white flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="truncate">Pune Urban Growth</span>
                </div>
              </div>

              <div>
                <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  Yesterday
                </div>
                <div className="space-y-1 text-neutral-400">
                  <div className="rounded-md px-2.5 py-1.5 hover:bg-white/5 transition-colors truncate">
                    Flood Inundation Survey
                  </div>
                  <div className="rounded-md px-2.5 py-1.5 hover:bg-white/5 transition-colors truncate">
                    Mumbai SAR Peninsula
                  </div>
                </div>
              </div>

              <div>
                <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  Previous 7 Days
                </div>
                <div className="space-y-1 text-neutral-400">
                  <div className="rounded-md px-2.5 py-1.5 hover:bg-white/5 transition-colors truncate">
                    Agricultural Phenology
                  </div>
                  <div className="rounded-md px-2.5 py-1.5 hover:bg-white/5 transition-colors truncate">
                    Deforestation Monitoring
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 text-[11px] text-neutral-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-white/15 flex items-center justify-center font-mono text-[10px] text-white">
                  S
                </div>
                <span className="text-neutral-300 font-medium">Research Workspace</span>
              </div>
              <span className="font-mono text-[10px] text-neutral-400">v2.1</span>
            </div>
          </div>

          {/* Main Chat Stream */}
          <div className="col-span-1 md:col-span-9 flex flex-col justify-between p-4 sm:p-6 bg-[#0a0a0a]">
            <div className="space-y-6">
              {/* User Query Message */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  <span>ATTACHMENTS (2)</span>
                  <span>•</span>
                  <span>SENTINEL-2 L2A</span>
                </div>
                <div className="max-w-xl rounded-2xl bg-white/[0.08] border border-white/15 px-4 py-3 text-sm text-neutral-100">
                  What changed between these two Sentinel-2 images of the northern Pune region?
                </div>
              </div>

              {/* Assistant Message */}
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-2.5 text-[12px] text-neutral-400">
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-white/20 bg-white/10 font-mono text-[10px] text-white font-semibold">
                    SQ
                  </div>
                  <span className="font-medium text-white">SatQuery AI</span>
                  <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-neutral-300">
                    SatQuery Change
                  </span>
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-400 font-medium">
                    Confidence: High · 89%
                  </span>
                </div>

                <div className="w-full rounded-2xl border border-white/10 bg-[#0f0f0f] p-5 space-y-4">
                  <p className="text-sm leading-relaxed text-neutral-200">
                    Built-up development increased across the northern portion of the area of interest
                    by <strong className="text-white font-medium">12.4 hectares (+14.2% change)</strong>.
                    Spectral change masks indicate agricultural plots transitioned into compacted
                    impervious surfaces and logistics staging between January and December 2024.
                  </p>

                  {/* Evidence Comparison Display */}
                  <div className="rounded-xl border border-white/10 bg-[#080808] p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-neutral-300" />
                        <span>GROUNDED EVIDENCE: BI-TEMPORAL CHANGE MASK</span>
                      </div>
                      <span className="text-neutral-400">EPSG:32643 · 10m/px</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <div className="rounded-lg border border-white/10 bg-[#141414] p-2 flex flex-col justify-between">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                          <span>BEFORE (T1)</span>
                          <span>2024-01-12</span>
                        </div>
                        <div className="h-28 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-[10px] font-mono text-neutral-400 border border-white/5">
                          [OPTICAL 10M T1]
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/10 bg-[#141414] p-2 flex flex-col justify-between">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-1">
                          <span>AFTER (T2)</span>
                          <span>2024-12-18</span>
                        </div>
                        <div className="h-28 rounded bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-[10px] font-mono text-neutral-400 border border-white/5">
                          [OPTICAL 10M T2]
                        </div>
                      </div>

                      <div className="rounded-lg border border-white/20 bg-[#181818] p-2 flex flex-col justify-between">
                        <div className="flex justify-between text-[10px] font-mono text-neutral-300 mb-1">
                          <span>CHANGE MASK</span>
                          <span className="text-emerald-400">+12.4 ha</span>
                        </div>
                        <div className="h-28 rounded bg-neutral-950 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                          <div className="absolute inset-0 bg-red-500/15 border-2 border-red-500/40 rounded m-2" />
                          <span className="font-mono text-[10px] text-red-300 z-10 font-medium">
                            BUILT-UP EXPANSION
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Analysis Trace */}
                  <div className="border-t border-white/10 pt-3">
                    <button
                      onClick={() => setTraceOpen(!traceOpen)}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors"
                    >
                      {traceOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      <span>HOW WAS THIS ANALYZED? (AUDIT TRACE)</span>
                    </button>

                    {traceOpen && (
                      <div className="mt-2.5 rounded-lg border border-white/10 bg-[#0a0a0a] p-3 text-[11px] font-mono space-y-1.5 text-neutral-400">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-neutral-400">TASK:</span>
                          <span className="text-neutral-200">Bi-Temporal Change Quantification</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-neutral-400">PIPELINE STEPS:</span>
                          <span className="text-neutral-200">Validation → Warp Co-registration → Otsu Differencing → CRS Area Math</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">MODELS:</span>
                          <span className="text-neutral-200">SatQuery Agent (Qwen3) + SatQuery Change (ChangeFormer)</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Simulated Composer */}
            <div className="mt-6 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#121212] px-3 py-2 text-sm text-neutral-400">
                <span className="text-neutral-400 hover:text-white cursor-pointer">+</span>
                <span className="flex-1 text-[13px] text-neutral-400">Ask a question about the imagery...</span>
                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
                  Send
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
