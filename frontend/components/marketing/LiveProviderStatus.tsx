"use client";

import { useEffect, useState } from "react";
import { getProviderStatus, type ProviderStatus } from "@/lib/api";

const PROVIDER_LABEL: Record<string, string> = {
  copernicus: "Copernicus Data Space (Sentinel-1/2)",
  bhoonidhi: "ISRO Bhoonidhi",
  usgs: "USGS EarthExplorer (M2M)",
  mock: "Synthetic demo catalogue",
};

export function LiveProviderStatus() {
  const [providers, setProviders] = useState<ProviderStatus[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProviderStatus()
      .then((data) => {
        if (!cancelled) setProviders(data);
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
        Live provider status is unavailable right now (backend unreachable).
      </div>
    );
  }

  if (!providers) {
    return <div className="tech-card rounded-2xl p-7 h-20 animate-pulse bg-white/[0.02]" />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {providers.map((p) => {
        const isHealthy = p.status === "healthy";
        return (
          <div
            key={p.provider}
            className="tech-card rounded-2xl p-5 flex items-start justify-between gap-4"
          >
            <div>
              <div className="font-mono text-xs text-white font-medium">
                {PROVIDER_LABEL[p.provider] ?? p.provider}
              </div>
              {p.message && (
                <div className="mt-1 text-[11px] text-neutral-500 leading-relaxed">{p.message}</div>
              )}
            </div>
            <div
              className={`flex items-center gap-1.5 shrink-0 font-mono text-[10px] uppercase font-medium ${
                isHealthy ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`} />
              {p.status.replace(/_/g, " ")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
