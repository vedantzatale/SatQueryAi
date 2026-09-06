"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-0 right-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-[1140px] rounded-2xl transition-all duration-300 ${
        scrolled
          ? "bg-[#0c0c0c]/90 backdrop-blur-md border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.8)]"
          : "bg-[#0e0e0e]/70 backdrop-blur-sm border border-white/10"
      }`}
    >
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6">
        {/* Brand wordmark */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold tracking-wider text-white uppercase"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-white/20 bg-white/5 font-mono text-[10px] text-white transition-all group-hover:border-white/50 group-hover:bg-white/10">
            SQ
          </div>
          <span className="font-mono tracking-tight text-[13px] text-neutral-100">
            SATQUERY<span className="text-neutral-500 ml-1">AI</span>
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/#features"
            className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Product
          </Link>
          <Link
            href="/features"
            className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/models"
            className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Models
          </Link>
          <Link
            href="/about"
            className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
          >
            About
          </Link>
        </nav>

        {/* Right CTA (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/contact"
            className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Contact
          </Link>
          <Link
            href="/app"
            className="group flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white transition-all duration-200 hover:border-white/50 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.12)]"
          >
            <span>Try SatQuery AI</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden p-1.5 text-neutral-400 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0c0c0c] px-6 py-4 rounded-b-2xl animate-fade-in">
          <nav className="flex flex-col gap-3">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5"
            >
              Product
            </Link>
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5"
            >
              Features
            </Link>
            <Link
              href="/models"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5"
            >
              Models
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5"
            >
              Contact
            </Link>
            <div className="pt-2">
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 py-2 text-sm font-medium text-white"
              >
                <span>Try SatQuery AI</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
