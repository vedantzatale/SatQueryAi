"use client";

import { Crosshair, Globe, Layers, MapPin, Maximize2, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function SatelliteMapModal() {
  const mapModalOpen = useAppStore((s) => s.mapModalOpen);
  const setMapModalOpen = useAppStore((s) => s.setMapModalOpen);
  const lastResult = useAppStore((s) => s.lastResult);

  if (!mapModalOpen) return null;

  const crs = lastResult?.data_provenance?.crs ?? "EPSG:4326";
  const sensor = lastResult?.data_provenance?.sensor ?? "Sentinel-2 MSI";
  const resolution = lastResult?.data_provenance?.resolution ?? 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-8 animate-fade-in">
      <div className="w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0e0e0e] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#121212] px-5 py-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-neutral-300" />
            <h2 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              Geospatial AOI Inspection // {crs}
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

        {/* Map Canvas / Grid HUD */}
        <div className="relative flex-1 min-h-[380px] bg-[#060606] bg-tech-grid flex items-center justify-center overflow-hidden p-8">
          {/* Coordinates HUD overlay */}
          <div className="absolute top-4 left-4 font-mono text-[11px] text-neutral-400 bg-black/75 p-3 rounded-xl border border-white/10 space-y-1">
            <div className="text-white font-medium">BBOX EXTENT (EPSG:4326)</div>
            <div>Min: [73.8567° E, 18.5204° N]</div>
            <div>Max: [73.9142° E, 18.5789° N]</div>
            <div>Sensor: {sensor} · GSD: {resolution}m</div>
          </div>

          <div className="absolute top-4 right-4 font-mono text-[10px] text-neutral-400 bg-black/75 px-3 py-1.5 rounded-lg border border-white/10">
            PROJECTION: REPROJECTED TO WGS84
          </div>

          {/* Central AOI Polygon Visualization */}
          <div className="relative w-80 h-56 rounded-xl border-2 border-white/40 bg-white/[0.04] flex flex-col items-center justify-center p-4">
            <div className="absolute -top-3 -left-3 flex items-center gap-1 bg-[#1a1a1a] border border-white/20 px-2 py-0.5 rounded font-mono text-[10px] text-white">
              <Crosshair className="h-3 w-3" />
              <span>AOI BOUNDARY</span>
            </div>

            <div className="w-full h-full rounded border border-dashed border-emerald-400/40 bg-emerald-500/5 flex flex-col items-center justify-center text-center p-3">
              <span className="font-mono text-xs text-emerald-300 font-medium">
                SURVEYED REGION
              </span>
              <span className="font-mono text-[10px] text-neutral-400 mt-1">
                Area: ~124,000 m² (12.4 ha)
              </span>
            </div>
          </div>

          {/* Bottom telemetry */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[11px] text-neutral-400 bg-black/75 px-4 py-2 rounded-xl border border-white/10">
            <span>MAP SCALE: 1 : 25,000</span>
            <span>GRID INTERVAL: 0.01°</span>
            <span>ELLIPSOID: WGS 84</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-white/10 bg-[#121212] px-5 py-3 text-xs font-mono">
          <span className="text-neutral-400">Ready for GIS export</span>
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
