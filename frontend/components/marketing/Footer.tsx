"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { SocialCloud } from "@/components/ui/footer-section-4-utils/social-cloud";

const FOOTER_TITLE = "Conversational intelligence for Earth observation & satellite imagery.";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
      }, 2000);
    }
  };

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Overview", href: "/#overview" },
        { label: "Change Detection", href: "/#product" },
        { label: "Multimodal Fusion", href: "/#features" },
        { label: "Model Registry", href: "/models" },
        { label: "Live Workspace", href: "/app" },
        { label: "FAQ & Inquiries", href: "/#faq" },
      ],
    },
    {
      title: "Architecture",
      links: [
        { label: "GeoChat Core", href: "/models" },
        { label: "Prithvi-EO Encoders", href: "/models" },
        { label: "TerraMind SAR", href: "/models" },
        { label: "Specialist Agents", href: "/about" },
        { label: "Radiometric Trace", href: "/about" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "STAC Catalog API", href: "/app" },
        { label: "GeoTIFF Ingestion", href: "/app" },
        { label: "Python SDK", href: "/about" },
        { label: "Cloud-Optimized GeoTIFF", href: "/about" },
        { label: "Enterprise Ingest", href: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About SatQuery", href: "/about" },
        { label: "Research & Methods", href: "/about" },
        { label: "System Status", href: "https://github.com/vedantzatale/SatQueryAi" },
        { label: "Contact Team", href: "/contact" },
        { label: "GitHub Repo", href: "https://github.com/vedantzatale/SatQueryAi" },
      ],
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: "easeOut",
      },
    },
  };

  return (
    <footer className="w-full py-16 px-4 sm:px-6 md:px-8 border-t border-white/10 bg-[#070707] text-white">
      <motion.div
        className="container mx-auto max-w-7xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-white/15 bg-[#0c0c0c] overflow-hidden shadow-2xl">
          {/* Left Carbon Card: SatQuery Theme */}
          <motion.div
            className="lg:col-span-4 relative overflow-hidden bg-gradient-to-b from-[#141414] via-[#0f0f0f] to-[#090909] border-b lg:border-b-0 lg:border-r border-white/15 flex flex-col justify-between p-8 md:p-10 lg:p-12"
            variants={itemVariants}
          >
            {/* SVG Noise Overlay */}
            <svg
              className="absolute inset-0 w-full h-full opacity-30 pointer-events-none mix-blend-overlay z-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <filter id="noiseFilterSatQuery">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.65"
                  numOctaves="4"
                  stitchTiles="stitch"
                />
              </filter>
              <rect width="100%" height="100%" filter="url(#noiseFilterSatQuery)" />
            </svg>

            {/* Subtle glow accent */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

            {/* Top Logo */}
            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-2.5 text-white group">
                <Image
                  src="/logo/satquertlogo.png"
                  alt="SatQuery AI Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-md object-contain shadow-sm shrink-0 transition-transform group-hover:scale-105"
                />
                <span className="text-xl font-bold tracking-tight font-mono">
                  SATQUERY<span className="text-neutral-500 ml-1">AI</span>
                </span>
              </Link>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-6">
              <h3 className="text-base sm:text-lg font-medium text-neutral-200 leading-snug">
                {FOOTER_TITLE}
              </h3>

              {/* Telemetry Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase text-neutral-400 tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>COPERNICUS · SENTINEL-1/2 · LANDSAT · EPSG:4326</span>
              </div>

              <div>
                <SocialCloud className="text-white/80 gap-3" />
              </div>

              <p className="text-xs font-mono text-neutral-500">
                &copy; {new Date().getFullYear()} SatQuery AI. All rights reserved.
              </p>
            </div>
          </motion.div>

          {/* Right Card: Dark theme categories grid & dispatch */}
          <motion.div
            className="lg:col-span-8 bg-[#0c0c0c] p-8 md:p-10 lg:p-12 flex flex-col justify-between"
            variants={itemVariants}
          >
            {/* Top Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-10">
              {footerLinks.map((section, idx) => (
                <div key={idx} className="flex flex-col space-y-4">
                  <h4 className="text-sm font-semibold tracking-wider uppercase font-mono text-white">
                    {section.title}
                  </h4>
                  <ul className="flex flex-col space-y-2.5 text-xs font-mono text-neutral-400">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        {link.href.startsWith("http") || link.href.startsWith("/app") ? (
                          <Link
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <Link
                            href={link.href}
                            className="hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Newsletter Dispatch */}
            <div className="space-y-4 mt-12 pt-8 border-t border-white/5">
              <div className="max-w-md">
                <h4 className="text-base font-medium text-white mb-1">
                  Earth Observation Dispatch
                </h4>
                <p className="text-xs text-neutral-400 font-sans">
                  Receive technical updates on multimodal foundation models, SAR transformers, and dataset releases.
                </p>
              </div>

              <form onSubmit={handleSubmit} suppressHydrationWarning className="flex flex-col sm:flex-row gap-3 max-w-md w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  suppressHydrationWarning
                  autoComplete="email"
                  className="flex-1 rounded-xl px-4 py-2.5 text-xs font-mono bg-white/[0.04] text-white placeholder:text-neutral-500 border border-white/15 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={subscribed}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-black px-6 py-2.5 text-xs font-medium hover:bg-neutral-200 transition-all shadow-sm shrink-0 disabled:bg-neutral-300"
                >
                  {subscribed ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}

export default Footer;
