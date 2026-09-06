"use client";

import { ArrowRight, Compass, Eye, Layers, Radio, Sparkles } from "lucide-react";

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const prompts = [
    {
      title: "Describe this satellite image.",
      category: "VQA & Captioning",
      icon: Eye,
    },
    {
      title: "What changed between these two images?",
      category: "Temporal Change Detection",
      icon: Layers,
    },
    {
      title: "Identify built-up regions.",
      category: "Semantic Segmentation",
      icon: Compass,
    },
    {
      title: "Where are the major water bodies?",
      category: "Feature Grounding",
      icon: Sparkles,
    },
    {
      title: "Compare optical and SAR imagery.",
      category: "Multimodal Fusion",
      icon: Radio,
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 font-mono text-base font-semibold text-white mb-6">
        SQ
      </div>

      <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-2">
        Ask your imagery.
      </h2>
      <p className="text-sm text-neutral-400 mb-8 max-w-md">
        Upload satellite imagery (GeoTIFF, TIFF, PNG, or JPEG) and ask natural-language questions
        about land cover, changes, and spatial evidence.
      </p>

      {/* Clickable prompt suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
        {prompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.title)}
              className="group tech-card rounded-xl p-3.5 flex flex-col justify-between hover:border-white/30 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  {item.category}
                </span>
                <Icon className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xs font-medium text-neutral-200 group-hover:text-white transition-colors">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
