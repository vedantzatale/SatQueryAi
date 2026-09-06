"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { PillNav } from "./PillNav";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { SpecularButton } from "@/components/ui/SpecularButton";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(pathname !== "/");

  useEffect(() => {
    if (pathname !== "/") {
      setIsVisible(true);
      return;
    }

    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let ticking = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const heroEl =
          document.getElementById("home") ||
          document.getElementById("overview") ||
          document.querySelector(".section-one");
        if (heroEl) {
          const rect = heroEl.getBoundingClientRect();
          // When scroll settles at the top of Hero section, show navbar
          if (rect.top <= 40 && rect.top >= -35) {
            setIsVisible(true);
          }
        }
      }, 120);

      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Strictly detect if the user is still in AirlockHero (above Hero section)
        const heroEl =
          document.getElementById("home") ||
          document.getElementById("overview") ||
          document.querySelector(".section-one");

        const heroRect = heroEl ? heroEl.getBoundingClientRect() : null;

        // 1. Strict: Never show while inside AirlockHero (hero section is still below top threshold)
        if (!heroRect || heroRect.top > 40) {
          setIsVisible(false);
        } else {
          // User is on or below Hero section
          const delta = currentScrollY - lastScrollY;

          // 2. Immediately after scroll down -> navbar goes up (hides)
          if (delta > 1.5) {
            setIsVisible(false);
          } else if (delta < -1.5) {
            // 3. Scroll up -> navbar shows up (reveals)
            setIsVisible(true);
          } else if (heroRect.top <= 40 && heroRect.top >= -35) {
            // 4. Exactly resting at Hero section top: show navbar
            setIsVisible(true);
          }
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [pathname]);

  const handleMobileClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setMobileMenuOpen(false);
    if (href.includes("#")) {
      const hash = href.split("#")[1];
      const targetEl = document.getElementById(hash);
      if (targetEl) {
        e.preventDefault();
        const buttons = Array.from(document.querySelectorAll("button"));
        const skipBtn = buttons.find((btn) =>
          btn.textContent?.toLowerCase().includes("skip")
        );
        if (skipBtn) skipBtn.click();

        setTimeout(() => {
          if (typeof window !== "undefined" && window.__lenis) {
            window.__lenis.scrollTo(targetEl, { offset: -70, duration: 1.4 });
          } else {
            targetEl.scrollIntoView({ behavior: "smooth" });
          }
        }, 50);
      }
    }
  };

  const shouldShow = isVisible || mobileMenuOpen;

  return (
    <header
      className={`fixed top-4 sm:top-5 left-0 right-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-[1240px] px-2 sm:px-4 pointer-events-none transition-[opacity,transform] duration-300 ease-out ${
        shouldShow
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-12 pointer-events-none invisible"
      }`}
    >
      <div className="flex h-14 sm:h-16 w-full items-center justify-between">
        {/* Left: Brand wordmark */}
        <div className="flex-1 flex items-center justify-start pointer-events-auto">
          <SpecularButton
            size="md"
            radius={9999}
            backgroundColor="#090909"
            textColor="#f0f0f0"
            lineColor="#ffffff"
            baseColor="#3a3a3a"
            intensity={1.2}
            shineSize={12}
            shineFade={35}
            thickness={1.2}
            followMouse
            proximity={250}
            autoAnimate={false}
            href="/"
            className="group !px-4 sm:!px-4.5 !py-0 !h-[46px]"
          >
            <Image
              src="/logo/satquertlogo.png"
              alt="SatQuery AI Logo"
              width={24}
              height={24}
              className="h-6 w-6 rounded-[5px] object-contain mr-2 shadow-sm shrink-0"
              priority
            />
            <span className="font-mono tracking-tight text-[14px] sm:text-[14.5px] text-neutral-100 uppercase">
              SATQUERY<span className="text-neutral-500 ml-1">AI</span>
            </span>
          </SpecularButton>
        </div>

        {/* Center: Dedicated floating box for Features, Models, About only */}
        <div className="hidden md:flex items-center justify-center pointer-events-auto">
          <PillNav
            items={[
              { label: "Features", href: "/#features" },
              { label: "Models", href: "/models" },
              { label: "About", href: "/about" },
            ]}
            activeHref={pathname}
            ease="power2.out"
            hoverDuration={0.65}
            leaveDuration={0.45}
            baseColor="#ffffff"
            pillColor="transparent"
            pillTextColor="#ffffff"
            hoveredPillTextColor="#000000"
            containerBg="#080808"
            initialLoadAnimation={false}
          />
        </div>

        {/* Right: Contact & Action CTA */}
        <div className="flex-1 hidden md:flex items-center justify-end gap-3 pointer-events-auto">
          <SpecularButton
            size="md"
            radius={9999}
            backgroundColor="#090909"
            textColor="#f0f0f0"
            lineColor="#ffffff"
            baseColor="#3a3a3a"
            intensity={1.2}
            shineSize={12}
            shineFade={35}
            thickness={1.2}
            followMouse
            proximity={250}
            autoAnimate={false}
            href="/contact"
            className="!h-[46px] !px-5 text-[14px] font-medium"
          >
            Contact
          </SpecularButton>
          <LiquidMetalButton
            label="Try SatQuery AI"
            href="/app"
            target="_blank"
            height={46}
            width={176}
            textColor="#ffffff"
            icon={<ArrowUpRight className="h-4 w-4 text-neutral-300" />}
          />
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center pointer-events-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center h-11 w-11 rounded-full border border-white/15 bg-[#0e0e0e]/90 text-neutral-300 hover:text-white shadow-md transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 border border-white/15 bg-[#0c0c0c]/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl animate-fade-in pointer-events-auto">
          <nav className="flex flex-col gap-3">
            <Link
              href="/#features"
              onClick={(e) => handleMobileClick(e, "/#features")}
              className="text-sm font-medium text-neutral-300 py-1.5 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/models"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5 hover:text-white transition-colors"
            >
              Models
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 py-1.5 hover:text-white transition-colors"
            >
              Contact
            </Link>
            <div className="pt-3 flex justify-center">
              <LiquidMetalButton
                label="Try SatQuery AI"
                href="/app"
                target="_blank"
                height={42}
                width={200}
                textColor="#ffffff"
                icon={<ArrowUpRight className="h-4 w-4 text-neutral-200" />}
                onClick={() => setMobileMenuOpen(false)}
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
