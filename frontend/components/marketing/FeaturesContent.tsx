"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { useTheme } from "@/lib/theme";

export function FeaturesContent() {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const featureList = [
    {
      title: "Natural-Language Image QA & Grounding",
      subtitle: "VQA · CAPTIONING · BOUNDING BOXES",
      desc: "Ask specific questions about visible land cover, infrastructure, or water bodies. SatQuery produces descriptive answers and returns precise pixel-level bounding boxes converted into real-world geographic coordinates.",
      tags: ["GeoChat-7B", "OpenCV Contours", "WGS84 Reprojection"],
    },
    {
      title: "Bi-Temporal Change Detection & Area Quantification",
      subtitle: "TEMPORAL ALIGNMENT · OTSU MASKS · GIS METRICS",
      desc: "Upload before and after images of the same area from different dates. SatQuery verifies CRS alignment, performs co-registration, extracts change masks, and calculates actual changed square meters using EPSG projected coordinate systems.",
      tags: ["ChangeFormer", "Rasterio Warp", "Square Meter Precision"],
    },
    {
      title: "Multimodal Optical + SAR Fusion",
      subtitle: "SPECTRAL REFLECTANCE + ALL-WEATHER RADAR",
      desc: "Reason over complementary Earth-observation signals. Combine optical multispectral bands (reflectance) with Sentinel-1 SAR (roughness, structural double-bounce) to identify urban density through persistent cloud cover.",
      tags: ["TerraMind 1.0", "Sentinel-1 C-Band", "Cloud Penetration"],
    },
    {
      title: "Auditable Transparency & Provenance",
      subtitle: "OBSERVABLE WORKFLOW · SENSOR METADATA",
      desc: "Every answer includes complete data provenance (satellite provider, scene ID, acquisition timestamp, resolution, applied preprocessing) and model provenance (model ID, version, fallback status) without black-box hallucination.",
      tags: ["Full Provenance", "Zero Hallucination", "Audit Trail"],
    },
    {
      title: "Deterministic Policy & Validation Layer",
      subtitle: "INPUT INSPECTION · COMPATIBILITY MATRIX",
      desc: "Before running any AI model, SatQuery checks GeoTIFF metadata, validates band counts, and enforces rigorous policy rules. If a user asks a change question with only one image, it prompts for the missing pair instead of hallucinating.",
      tags: ["Rasterio Inspector", "Policy Enforcement", "Safe Failure Exits"],
    },
    {
      title: "Dossier & GeoJSON Export",
      subtitle: "REPORTLAB PDF · EPSG:4326 FEATURECOLLECTION",
      desc: "Export comprehensive analysis reports with embedded visual evidence and metadata as PDF dossiers, or download GIS-ready GeoJSON feature collections with reprojected geographic polygons.",
      tags: ["ReportLab PDF", "GeoPandas GeoJSON", "GIS Ready"],
    },
  ];

  return (
    <SmoothScroll>
      <div
        className={`min-h-screen ${
          isLight ? "bg-[#f5f2eb] text-[#18181b]" : "bg-[#080808] text-neutral-100"
        } flex flex-col font-sans selection:bg-white selection:text-black transition-colors duration-200`}
      >
        <Navbar />

        <main className="flex-1 pt-36 sm:pt-44 pb-28">
          <div className="max-w-[1140px] mx-auto px-6 sm:px-8">
            <div className="max-w-3xl mb-16 space-y-5">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs tracking-wider uppercase ${
                  isLight
                    ? "border-black/10 bg-black/5 text-neutral-700"
                    : "border-white/10 bg-white/[0.04] text-neutral-300"
                }`}
              >
                <span>CAPABILITIES & ARCHITECTURE</span>
              </div>
              <h1
                className={`text-[clamp(38px,5.2vw,62px)] font-bold sm:font-semibold leading-[1.08] tracking-tight ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                Engineered for Earth observation.
              </h1>
              <p
                className={`text-[18px] sm:text-[19px] leading-relaxed font-normal ${
                  isLight ? "text-neutral-600" : "text-neutral-200"
                }`}
              >
                SatQuery AI bridges remote sensing expertise and natural-language intelligence.
                Explore the modular tools and specialist algorithms that drive the platform.
              </p>
            </div>

            {/* Grid of features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureList.map((item, idx) => (
                <div
                  key={idx}
                  className={`tech-card rounded-2xl p-8 flex flex-col justify-between border transition-all ${
                    isLight
                      ? "!bg-[#fcfbf8] !border-black/10 hover:!border-black/20 shadow-sm"
                      : "border-white/10 bg-[#0c0c0c] hover:border-white/20"
                  }`}
                >
                  <div>
                    <div
                      className={`font-mono text-xs uppercase tracking-wider mb-2 font-medium ${
                        isLight ? "text-neutral-500" : "text-neutral-400"
                      }`}
                    >
                      {item.subtitle}
                    </div>
                    <h2
                      className={`text-xl sm:text-2xl font-bold mb-3 tracking-tight ${
                        isLight ? "text-neutral-900" : "text-white"
                      }`}
                    >
                      {item.title}
                    </h2>
                    <p
                      className={`text-[15px] sm:text-[15.5px] leading-relaxed font-normal ${
                        isLight ? "text-neutral-600" : "text-neutral-200"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  <div
                    className={`mt-8 pt-4 border-t flex flex-wrap gap-2 ${
                      isLight ? "border-black/10" : "border-white/10"
                    }`}
                  >
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`rounded-md border px-2.5 py-1 font-mono text-xs ${
                          isLight
                            ? "border-black/10 bg-black/5 text-neutral-700"
                            : "border-white/15 bg-white/5 text-neutral-200"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div
              className={`mt-20 rounded-2xl border p-10 text-center space-y-4 ${
                isLight ? "border-black/10 bg-[#fcfbf8] shadow-sm" : "border-white/10 bg-[#0d0d0d]"
              }`}
            >
              <h2
                className={`text-2xl sm:text-3xl font-bold ${
                  isLight ? "text-neutral-900" : "text-white"
                }`}
              >
                Experience SatQuery in action
              </h2>
              <p
                className={`text-[15.5px] max-w-md mx-auto ${
                  isLight ? "text-neutral-600" : "text-neutral-200"
                }`}
              >
                Try out these capabilities directly in the conversational workspace.
              </p>
              <div className="pt-3">
                <Link
                  href="/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm sm:text-base font-semibold transition-all shadow-lg ${
                    isLight
                      ? "bg-[#18181b] text-white hover:bg-black shadow-black/10"
                      : "bg-white text-black hover:bg-neutral-200 hover:shadow-white/10"
                  }`}
                >
                  <span>Open SatQuery Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScroll>
  );
}
