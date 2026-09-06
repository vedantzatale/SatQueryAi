"use client";

import { useEffect, useState } from "react";
import { getModelHealth, listModels, type ModelHealth, type ModelRegistryEntry } from "@/lib/api";

interface ModelCopy {
  name: string;
  tag: string;
  role: string;
  underlying: string;
}

// Descriptive copy for each real registry entry -- what the model does and
// what it's built around. Never the source of truth for status/version/
// fallback: those are fetched live from the backend below.
const MODEL_COPY: Record<string, ModelCopy> = {
  qwen_agent: {
    name: "SATQUERY AGENT",
    tag: "Orchestration & Task Planning",
    role: "Natural-language query understanding, multilingual intent parsing (English, Hindi, Hinglish), spatial coordinate extraction, and deterministic task routing.",
    underlying: "Adapted Qwen3 agent pipeline with strict schema enforcement.",
  },
  internvl_rs: {
    name: "SATQUERY VISION",
    tag: "Remote-Sensing VQA & Grounding",
    role: "Answers natural-language visual questions, generates descriptive captions, and predicts bounding boxes for identified ground features.",
    underlying: "Domain-adapted vision-language architecture (target: InternVL3-1B).",
  },
  prithvi: {
    name: "SATQUERY EARTH",
    tag: "Multispectral Representation",
    role: "Extracts dense geospatial embeddings and multispectral signatures across multiple spectral bands.",
    underlying: "Specialist foundation model layer built around Prithvi-EO-2.0.",
  },
  croma: {
    name: "SATQUERY FUSION",
    tag: "Optical + SAR Multimodal Analysis",
    role: "Jointly reasons over optical multispectral imagery and synthetic aperture radar (SAR) backscatter, enabling cloud-penetrating verification of surface structures.",
    underlying: "Multimodal EO cross-attention fusion (target: CROMA).",
  },
  changeformer: {
    name: "SATQUERY CHANGE",
    tag: "Bi-Temporal Change Detection",
    role: "Identifies land-cover and structural transformations between paired satellite acquisitions, generates binary change masks, and calculates altered surface area.",
    underlying: "Bi-temporal transformer architecture (target: ChangeFormer).",
  },
  terramind: {
    name: "SATQUERY MULTIMODAL",
    tag: "Cross-Modal Representation (disabled by default)",
    role: "Joint optical/multispectral/SAR representation for future cross-modal tasks beyond the current fusion path.",
    underlying: "TerraMind — resource-heavy, off by default per the current deployment plan.",
  },
};

interface LiveEntry extends ModelRegistryEntry {
  health: ModelHealth | null;
}

export function LiveModelRegistry() {
  const [entries, setEntries] = useState<LiveEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listModels()
      .then(async (models) => {
        const withHealth = await Promise.all(
          models.map(async (m) => {
            if (!m.enabled) return { ...m, health: null };
            try {
              const health = await getModelHealth(m.model_id);
              return { ...m, health };
            } catch {
              return { ...m, health: null };
            }
          })
        );
        if (!cancelled) setEntries(withHealth);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 font-mono text-xs text-neutral-400">
        Live registry status is unavailable right now (backend unreachable) — showing no
        status rather than a guess.
      </div>
    );
  }

  if (!entries) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="tech-card rounded-2xl p-7 h-28 animate-pulse bg-white/[0.02]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const copy = MODEL_COPY[entry.model_id] ?? {
          name: entry.model_id.toUpperCase(),
          tag: entry.capability.join(", "),
          role: "Registered specialist model.",
          underlying: `v${entry.version}`,
        };
        const statusLabel = !entry.enabled
          ? "Disabled"
          : entry.health?.status
          ? entry.health.status
          : "Unknown";
        const statusColor = !entry.enabled
          ? "text-neutral-500"
          : entry.health?.status === "healthy" || entry.health?.status === "available"
          ? "text-emerald-400"
          : entry.health?.status
          ? "text-amber-400"
          : "text-neutral-500";

        return (
          <div
            key={entry.model_id}
            className="tech-card rounded-2xl p-7 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-mono text-base font-semibold tracking-wide text-white">
                  {copy.name}
                </h2>
                <span className="font-mono text-[10px] text-neutral-400 border border-white/10 bg-white/5 px-2 py-0.5 rounded">
                  {copy.tag}
                </span>
                {entry.health?.is_mock && (
                  <span className="font-mono text-[10px] text-neutral-500 border border-neutral-700 px-2 py-0.5 rounded">
                    mock mode
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">{copy.role}</p>
              <div className="font-mono text-xs text-neutral-400">
                Technology: <span className="text-neutral-300">{copy.underlying}</span>
              </div>
            </div>

            <div className="flex md:flex-col items-start md:items-end justify-between border-t md:border-t-0 border-white/10 pt-4 md:pt-0 font-mono text-[11px] text-neutral-400">
              <div className={`flex items-center gap-1.5 font-medium ${statusColor}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusColor.replace("text-", "bg-")}`} />
                <span>{statusLabel}</span>
              </div>
              <div className="mt-1 text-neutral-400 text-[10px]">
                Fallback: {entry.fallback ?? "none registered"}
              </div>
              <div className="mt-1 text-neutral-500 text-[10px]">v{entry.version}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
