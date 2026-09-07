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
  onRegenerate?: () => void;
}

export function AssistantMessage({ content, result, message, onOpenViewer, onRegenerate }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const setEvidenceModalData = useAppStore((s) => s.setEvidenceModalData);

  const answer = message?.content ?? result?.answer ?? content ?? "Analysis completed.";
  const trace = message?.analysisTrace;
  const confidence = result?.confidence;
  // Only ever set on real completed executions (see confidence.notes in that
  // case: "Confidence unavailable in demo mode -- not calibrated"). trace is
  // never present alongside a real result -- it's exclusive to the offline
  // canned-narrative fallback in ChatArea.tsx -- so this only affects the
  // plain-text confidence branch below, never ConfidenceBadge.
  const isDemo = result?.model_provenance?.demo_mode;
  const changeAnalysis = message?.changeAnalysis;
  const multimodal = message?.multimodal;

  const showToast = (text: string) => {
    setFeedbackToast(text);
    setTimeout(() => {
      setFeedbackToast((current) => (current === text ? null : current));
    }, 2400);
  };

  const handleViewerOpen = (title: string, image: string, metrics?: { label: string; value: string }[]) => {
    if (onOpenViewer) {
      onOpenViewer(title, image, metrics);
    } else {
      setEvidenceModalData({ title, image, metrics });
    }
  };

  function handleCopy() {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(answer)
        .then(() => {
          setCopied(true);
          showToast("Copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    try {
      const el = document.createElement("textarea");
      el.value = answer;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      showToast("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Unable to copy");
    }
  }

  function handleThumbsUp() {
    if (liked === true) {
      setLiked(null);
      setFeedbackToast(null);
    } else {
      setLiked(true);
      showToast("Feedback submitted: Accurate analysis");
    }
  }

  function handleThumbsDown() {
    if (liked === false) {
      setLiked(null);
      setFeedbackToast(null);
    } else {
      setLiked(false);
      showToast("Feedback submitted: Discrepancy flagged");
    }
  }

  function handleRegenerateClick() {
    setIsRegenerating(true);
    showToast("Regenerating analysis...");
    if (onRegenerate) {
      onRegenerate();
    }
    setTimeout(() => setIsRegenerating(false), 1200);
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
          {/* trace is exclusive to the offline canned-narrative fallback (see
              ChatArea.tsx) and never present on a real completed execution,
              so this can only ever fire for a genuine result. */}
          {!trace && isDemo && (
            <span
              className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-300"
              title="No trained model ran. This result came from a pixel-color heuristic stand-in, so it is not a reliable analysis."
            >
              DEMO — no trained model
            </span>
          )}
        </div>

        {trace && (
          <ConfidenceBadge
            confidence={trace.confidence}
            tier={trace.confidenceTier}
          />
        )}
        {/* Real executions never carry a calibrated model_confidence in demo
            mode (see confidence.notes from the backend) -- ConfidenceBadge's
            `?? 0.9` fallback would fabricate a number here, so a real result
            gets a plain-text label instead, exactly qualified per the
            backend's own caveat, rather than routed through that component. */}
        {!trace && confidence && (
          <span className="text-[11px] text-neutral-400 font-mono">
            {confidence.overall_level} confidence
            {isDemo
              ? " (uncalibrated)"
              : confidence.model_confidence != null
                ? ` (${(confidence.model_confidence * 100).toFixed(0)}%)`
                : ""}
          </span>
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
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            copied ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Copy response"
          aria-label="Copy response"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={handleThumbsUp}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            liked === true
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "hover:bg-white/10 hover:text-white"
          }`}
          title="Good response / Accurate analysis"
          aria-label="Like response"
        >
          <ThumbsUp className={`h-4 w-4 ${liked === true ? "fill-emerald-400" : ""}`} />
        </button>

        <button
          type="button"
          onClick={handleThumbsDown}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
            liked === false
              ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              : "hover:bg-white/10 hover:text-white"
          }`}
          title="Bad response / Flag discrepancy"
          aria-label="Dislike response"
        >
          <ThumbsDown className={`h-4 w-4 ${liked === false ? "fill-rose-400" : ""}`} />
        </button>

        <button
          type="button"
          onClick={handleRegenerateClick}
          disabled={isRegenerating}
          className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition-colors ${
            isRegenerating ? "text-white bg-white/10 pointer-events-none" : ""
          }`}
          title="Regenerate response"
          aria-label="Regenerate response"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin text-white" : ""}`} />
        </button>

        {/* Dynamic Feedback Toast */}
        {feedbackToast && (
          <span className="ml-1 text-[11px] font-mono text-neutral-300 bg-[#1e1e1e] border border-white/10 px-2.5 py-1 rounded-md animate-in fade-in zoom-in-95 duration-150 select-none">
            {feedbackToast}
          </span>
        )}
      </div>
    </div>
  );
}
