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
      <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-7 text-sm sm:text-[15px] font-sans text-neutral-300 leading-relaxed">
        Live provider status is unavailable right now (backend unreachable).
      </div>
    );
  }

  if (!providers) {
    return <div className="tech-card rounded-2xl p-7 h-20 animate-pulse bg-white/[0.02]" />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {providers.map((p) => {
        const isHealthy = p.status === "healthy";
        return (
          <div
            key={p.provider}
            className="tech-card rounded-2xl p-6 flex items-start justify-between gap-4 border border-white/10 bg-[#0c0c0c] hover:border-white/20 transition-all"
          >
            <div>
              <div className="font-mono text-sm sm:text-[15px] text-white font-semibold">
                {PROVIDER_LABEL[p.provider] ?? p.provider}
              </div>
              {p.message && (
                <div className="mt-1.5 text-xs sm:text-[13px] text-neutral-300 leading-relaxed font-sans">{p.message}</div>
              )}
            </div>
            <div
              className={`flex items-center gap-1.5 shrink-0 font-mono text-xs uppercase font-medium ${
                isHealthy ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-amber-400"}`} />
              {p.status.replace(/_/g, " ")}
            </div>
          </div>
        );
      })}
    </div>
  );
}
