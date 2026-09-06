"use client";

import { useState } from "react";
import { Check, Copy, Download, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { AnalysisTrace } from "./AnalysisTrace";
import { EvidenceViewer } from "./EvidenceViewer";
import type { ExecutionResult } from "@/lib/types";

interface AssistantMessageProps {
  content?: string;
  result?: ExecutionResult | null;
}

export function AssistantMessage({ content, result }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);

  const answer = result?.answer ?? content ?? "Analysis completed.";
  const confidence = result?.confidence;
  const isDemo = result?.model_provenance?.demo_mode;
  const modelName = result?.model ?? "SatQuery Orchestrator";
  const task = result?.task;

  function handleCopy() {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-start gap-3.5 w-full max-w-3xl animate-fade-in">
      {/* Top Identity & Badges */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <div className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-white/20 bg-white/10 font-mono text-[10px] text-white font-bold">
          SQ
        </div>
        <span className="font-medium text-white">SatQuery AI</span>

        {task && (
          <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
            {task}
          </span>
        )}

        {confidence && (
          <div className="flex items-center gap-1 rounded bg-white/5 border border-white/10 px-2 py-0.5 font-mono text-[10px] text-neutral-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>
              Confidence: {confidence.overall_level}
              {confidence.model_confidence != null ? ` · ${(confidence.model_confidence * 100).toFixed(0)}%` : ""}
            </span>
          </div>
        )}

        {isDemo && (
          <span className="rounded bg-neutral-900 border border-neutral-700 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
            Demo Mode
          </span>
        )}
      </div>

      {/* Answer Body */}
      <div className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 sm:p-6 space-y-4">
        <p className="text-sm sm:text-[15px] leading-relaxed text-neutral-200 whitespace-pre-wrap">
          {answer}
        </p>

        {/* Evidence Visualizations */}
        {result && result.evidence && result.evidence.length > 0 && (
          <EvidenceViewer evidence={result.evidence} executionId={result.execution_id} />
        )}

        {/* Observable Analysis Trace */}
        {result && <AnalysisTrace result={result} />}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] font-mono text-neutral-400">
          <div className="text-neutral-400 truncate max-w-xs">
            Model: {modelName}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
