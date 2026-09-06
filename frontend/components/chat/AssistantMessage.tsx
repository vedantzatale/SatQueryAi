"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Download,
  Layers,
  MoreHorizontal,
  RefreshCw,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnalysisTrace } from "./AnalysisTrace";
import { EvidenceViewer } from "./EvidenceViewer";
import type { ExecutionResult } from "@/lib/types";

interface AssistantMessageProps {
  content?: string;
  result?: ExecutionResult | null;
}

export function AssistantMessage({ content, result }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

  const answer = result?.answer ?? content ?? "Analysis completed.";
  const confidence = result?.confidence;
  const isDemo = result?.model_provenance?.demo_mode;
  const modelName = result?.model ?? "SatQuery Orchestrator";
  const task = result?.task;

  function handleCopy() {
    navigator.clipboard
      .writeText(answer)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="flex flex-col items-start gap-3 w-full max-w-3xl animate-fade-in font-sans">
      {/* Top Metadata Header (Clean Model Tag) */}
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <Image
          src="/logo/satquertlogo.png"
          alt="SatQuery AI"
          width={20}
          height={20}
          className="h-5 w-5 rounded-[4px] object-contain shrink-0"
        />
        <span className="font-medium text-white text-xs">SatQuery AI</span>
        {confidence && (
          <span className="text-[11px] text-neutral-400 font-mono">
            • {confidence.overall_level} confidence
            {confidence.model_confidence != null
              ? ` (${(confidence.model_confidence * 100).toFixed(0)}%)`
              : ""}
          </span>
        )}
      </div>

      {/* Main Response Text (Clean ChatGPT Typography) */}
      <div className="w-full text-[15.5px] leading-[1.65] text-[#ececec] whitespace-pre-wrap font-normal">
        {answer}
      </div>

      {/* Evidence Visualizations (If Present) */}
      {result && result.evidence && result.evidence.length > 0 && (
        <div className="w-full mt-2">
          <EvidenceViewer evidence={result.evidence} executionId={result.execution_id} />
        </div>
      )}

      {/* Observable Analysis Trace */}
      {result && (
        <div className="w-full mt-1">
          <AnalysisTrace result={result} />
        </div>
      )}

      {/* ChatGPT-style Action Toolbar */}
      <div className="flex items-center gap-2 pt-2 text-neutral-400">
        <button
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          title="Copy response"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setLiked(liked === true ? null : true)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${
            liked === true ? "text-white bg-white/10" : "hover:text-white"
          }`}
          title="Good response"
        >
          <ThumbsUp className="h-4 w-4" />
        </button>

        <button
          onClick={() => setLiked(liked === false ? null : false)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${
            liked === false ? "text-white bg-white/10" : "hover:text-white"
          }`}
          title="Bad response"
        >
          <ThumbsDown className="h-4 w-4" />
        </button>

        <button
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          title="Regenerate response"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
