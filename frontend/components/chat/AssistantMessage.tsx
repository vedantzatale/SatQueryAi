"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { AnalysisTrace } from "./AnalysisTrace";
import { EvidenceViewer } from "./EvidenceViewer";
import { ChangeAnalysisBlock } from "./ChangeAnalysisBlock";
import { MultimodalBlock } from "./MultimodalBlock";
import { ExecutionDrawer } from "./ExecutionDrawer";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { ExecutionResult, Message } from "@/lib/types";
import { useAppStore } from "@/lib/store";

interface AssistantMessageProps {
  content?: string;
  result?: ExecutionResult | null;
  message?: Message;
  onOpenViewer?: (title: string, image: string, metrics?: { label: string; value: string }[]) => void;
}

export function AssistantMessage({ content, result, message, onOpenViewer }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const setEvidenceModalData = useAppStore((s) => s.setEvidenceModalData);

  const answer = message?.content ?? result?.answer ?? content ?? "Analysis completed.";
  const trace = message?.analysisTrace;
  const confidence = result?.confidence;
  const changeAnalysis = message?.changeAnalysis;
  const multimodal = message?.multimodal;

  const handleViewerOpen = (title: string, image: string, metrics?: { label: string; value: string }[]) => {
    if (onOpenViewer) {
      onOpenViewer(title, image, metrics);
    } else {
      setEvidenceModalData({ title, image, metrics });
    }
  };

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
    <div className="flex flex-col items-start gap-3 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
      {/* Top Metadata Header with Logo & Model & Confidence */}
      <div className="flex items-center justify-between w-full text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#141414] border border-[#2e2e2e] flex items-center justify-center shrink-0">
            <Image
              src="/logo/satquertlogo.png"
              alt="SatQuery AI"
              width={16}
              height={16}
              className="h-4 w-4 rounded-[3px] object-contain shrink-0"
            />
          </div>
          <span className="font-semibold text-white text-xs tracking-wide">SatQuery</span>
          {trace && (
            <span className="text-[10px] text-[#737373] font-mono border border-[#262626] px-1.5 py-0.5 rounded">
              {trace.models.join(" + ")}
            </span>
          )}
          {!trace && result?.model && (
            <span className="text-[10px] text-[#737373] font-mono border border-[#262626] px-1.5 py-0.5 rounded">
              {result.model}
            </span>
          )}
        </div>

        {trace && (
          <ConfidenceBadge
            confidence={trace.confidence}
            tier={trace.confidenceTier}
          />
        )}
        {!trace && confidence && (
          <ConfidenceBadge
            confidence={confidence.model_confidence ?? 0.9}
            tier={confidence.overall_level}
          />
        )}
      </div>

      {/* Main Response Text */}
      <div className="w-full text-[15px] sm:text-[15.5px] leading-[1.65] text-[#ececec] whitespace-pre-wrap font-normal space-y-2">
        {answer.split("\n\n").map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

      {/* Interactive Bi-Temporal Split Slider (If Present) */}
      {changeAnalysis && (
        <div className="w-full mt-2">
          <ChangeAnalysisBlock data={changeAnalysis} onOpenViewer={handleViewerOpen} />
        </div>
      )}

      {/* Cross-Sensor Multimodal Fusion (If Present) */}
      {multimodal && (
        <div className="w-full mt-2">
          <MultimodalBlock data={multimodal} onOpenViewer={handleViewerOpen} />
        </div>
      )}

      {/* Evidence Viewer (If Present from message or result) */}
      {message?.evidence && !changeAnalysis && !multimodal && (
        <div className="w-full mt-2">
          <EvidenceViewer evidence={message.evidence} onOpenModal={handleViewerOpen} />
        </div>
      )}

      {result && result.evidence && result.evidence.length > 0 && !changeAnalysis && !multimodal && (
        <div className="w-full mt-2">
          <EvidenceViewer evidence={result.evidence} executionId={result.execution_id} />
        </div>
      )}

      {/* Observable Pipeline Execution Trace */}
      {trace && (
        <div className="w-full mt-1">
          <ExecutionDrawer trace={trace} />
        </div>
      )}

      {result && !trace && (
        <div className="w-full mt-1">
          <AnalysisTrace result={result} />
        </div>
      )}

      {/* ChatGPT-style Action Toolbar */}
      <div className="flex items-center gap-2 pt-2 text-neutral-400">
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          title="Copy response"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={() => setLiked(liked === true ? null : true)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${
            liked === true ? "text-white bg-white/10" : "hover:text-white"
          }`}
          title="Accurate Grounding"
        >
          <ThumbsUp className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setLiked(liked === false ? null : false)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${
            liked === false ? "text-white bg-white/10" : "hover:text-white"
          }`}
          title="Flag Spatial Discrepancy"
        >
          <ThumbsDown className="h-4 w-4" />
        </button>

        <button
          type="button"
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
