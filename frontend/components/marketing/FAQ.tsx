"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQLuxuryProps {
  faqs?: FAQItem[];
  backgroundColor?: string;
  blob1FromColor?: string;
  blob1ViaColor?: string;
  blob2FromColor?: string;
  blob2ViaColor?: string;
  title?: string;
  subtitle?: string;
  titleColor?: string;
  subtitleColor?: string;
  borderColor?: string;
  questionTextColor?: string;
  activeQuestionTextColor?: string;
  hoverQuestionTextColor?: string;
  answerTextColor?: string;
  iconColor?: string;
  hoverIconColor?: string;
}

export function FAQLuxury({
  faqs = [
    {
      q: "How does SatQuery AI process multimodal satellite imagery?",
      a: "SatQuery AI pairs visual foundation models like GeoChat and Prithvi-EO with radar transformers such as TerraMind. When optical sensors are obscured by atmospheric clouds, the pipeline automatically coregisters Sentinel-1 C-Band SAR backscatter to resolve surface moisture and structural boundaries."
    },
    {
      q: "What coordinate systems and raster resolutions are supported?",
      a: "SatQuery natively handles standard Earth observation projections including UTM (WGS84), EPSG:4326, and custom GeoTIFF tie-points. Supported Ground Sampling Distances (GSD) span from 10m/20m for Sentinel-2, 15m/30m for Landsat-8/9, down to 3m for PlanetScope and sub-meter drone orthomosaics."
    },
    {
      q: "How does the bi-temporal change detection workflow function?",
      a: "The agent executes sub-pixel radiometric coregistration across multi-date acquisitions (T1 and T2). Deep differential feature maps extract permanent structural conversions and calculate net hectarage changes while filtering out transient seasonal crop phenology."
    },
    {
      q: "Are temporary chat sessions private and unsaved?",
      a: "Yes. When Temporary Chat mode is enabled, queries and uploaded raster matrices are processed in isolated volatile memory. Temporary conversations are strictly excluded from sidebar history and discarded upon session termination."
    },
    {
      q: "Can I connect my organization's private STAC catalogs?",
      a: "SatQuery supports standard SpatioTemporal Asset Catalog (STAC) API endpoints, AWS Open Data Registry, and Copernicus Open Access Hub. Enterprise deployments can ingest custom private S3 or Cloud Optimized GeoTIFF (COG) buckets."
    },
    {
      q: "What metrics are provided in the observable execution trace?",
      a: "Every response includes an expandable 'How was this analyzed?' drawer displaying active sensor pipelines, model routing weights, radiometric calibration stages, processing latencies in milliseconds, and calibrated confidence intervals."
    }
  ],
  title = "Inquiries",
  subtitle = "Earth observation intelligence & foundation model architecture.",
}: FAQLuxuryProps) {
  const [active, setActive] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="w-full min-h-[70vh] flex items-center justify-center relative overflow-hidden py-24 select-none border-t border-white/10 bg-[#070707] text-white transition-colors"
    >
      {/* Subtle Background Animated Blobs */}
      <div className="absolute inset-0 opacity-40 pointer-events-none transition-opacity">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px] bg-gradient-to-bl from-[#262626] via-[#141414] to-transparent"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[140px] bg-gradient-to-tr from-[#1f1f1f] via-[#0a0a0a] to-transparent"
        />
      </div>

      <div className="w-full max-w-4xl z-10 px-4 sm:px-6">
        <div className="mb-14 pl-6 border-l-2 border-white/20">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-2 text-white font-serif">
            {title}
          </h2>
          <p className="tracking-wider uppercase text-xs font-mono text-[#888888]">
            {subtitle}
          </p>
        </div>

        <div className="space-y-0">
          {faqs.map((faq, i) => {
            const isOpen = active === i;
            return (
              <div
                key={i}
                className={`border-t border-white/10 ${
                  i === faqs.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActive(isOpen ? null : i)}
                  className="w-full py-6 sm:py-8 text-left flex justify-between items-center group transition-colors"
                >
                  <span
                    className={`text-lg sm:text-2xl font-light transition-colors duration-300 pr-4 ${
                      isOpen
                        ? "text-white font-normal"
                        : "text-[#a3a3a3] group-hover:text-white"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`shrink-0 transition-colors ${
                      isOpen
                        ? "text-white"
                        : "text-[#737373] group-hover:text-white"
                    }`}
                  >
                    <ArrowRight size={22} />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pr-6 sm:pr-12 text-sm sm:text-base font-light leading-relaxed max-w-3xl text-[#d4d4d4]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const FAQ = FAQLuxury;
export default FAQLuxury;
