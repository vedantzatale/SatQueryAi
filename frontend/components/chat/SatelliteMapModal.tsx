"use client";

import dynamic from "next/dynamic";
import { Globe, MapPinOff, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { Geometry } from "geojson";

const SatelliteMap = dynamic(
  () => import("./SatelliteMap").then((mod) => mod.SatelliteMap),
  { ssr: false }
);

/** Resolves the one real georeferenced geometry available for the current
 * result, if any -- AOI from data provenance (satellite-retrieval queries),
 * else the first evidence entry carrying a real pixel-to-WGS84 reprojected
 * geometry (grounding/change results on a georeferenced image). Returns null
 * rather than a placeholder when nothing real is available. */
function resolveGeometry(
  lastResult: ReturnType<typeof useAppStore.getState>["lastResult"]
): Geometry | null {
  const aoi = lastResult?.data_provenance?.aoi;
  if (aoi && typeof aoi === "object" && "type" in aoi) {
    return aoi as unknown as Geometry;
  }
  const evidenceWithGeometry = lastResult?.evidence?.find((ev) => ev.geo_geometry);
  if (evidenceWithGeometry?.geo_geometry) {
    return evidenceWithGeometry.geo_geometry as unknown as Geometry;
  }
  return null;
}

export function SatelliteMapModal() {
  const mapModalOpen = useAppStore((s) => s.mapModalOpen);
  const setMapModalOpen = useAppStore((s) => s.setMapModalOpen);
  const lastResult = useAppStore((s) => s.lastResult);

  if (!mapModalOpen) return null;

  const provenance = lastResult?.data_provenance ?? null;
  const geometry = resolveGeometry(lastResult);
  const evidenceWithArea = lastResult?.evidence?.find((ev) => ev.area_m2 != null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8 animate-fade-in">
      <div className="w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0e0e0e] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#121212] px-5 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-neutral-300" />
            <h2 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              Geospatial AOI Inspection {provenance?.crs ? `// ${provenance.crs}` : ""}
            </h2>
          </div>
          <button
            onClick={() => setMapModalOpen(false)}
            className="rounded-lg p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close Map"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative flex-1 min-h-[380px] bg-[#060606]">
          {geometry ? (
            <SatelliteMap geometry={geometry} />
          ) : (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center gap-2 p-8 text-center">
              <MapPinOff className="h-6 w-6 text-neutral-500" />
              <span className="font-mono text-xs text-neutral-400">
                No geospatial reference available for this result
              </span>
              <span className="max-w-sm text-[11px] text-neutral-600">
                This result has no area-of-interest or georeferenced evidence to plot &mdash;
                either no location was resolved, or the source image has no CRS.
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-[#121212] px-5 py-3 text-xs font-mono flex-wrap gap-2">
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Sensor: {provenance?.sensor ?? "unknown"}</span>
            <span>GSD: {provenance?.resolution != null ? `${provenance.resolution}m` : "unknown"}</span>
            {evidenceWithArea && (
              <span className="text-emerald-400">
                Area: {evidenceWithArea.area_m2!.toLocaleString()} m&sup2;
              </span>
            )}
          </div>
          <button
            onClick={() => setMapModalOpen(false)}
            className="rounded-xl bg-white px-4 py-1.5 font-medium text-black hover:bg-neutral-200 transition-colors"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
