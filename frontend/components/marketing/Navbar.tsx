"use client";

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

    let ticking = false;
    const checkVisibility = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const visible = window.scrollY > 200;
        setIsVisible(visible);
        ticking = false;
      });
    };

    checkVisibility();

    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
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

  return (
    <header
      className={`fixed top-4 sm:top-5 left-0 right-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-[1240px] px-2 sm:px-4 pointer-events-none transition-[opacity,transform] duration-300 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-8 pointer-events-none invisible"
      }`}
    >
      <div className="flex h-12 sm:h-14 w-full items-center justify-between">
        {/* Left: Brand wordmark */}
        <div className="flex-1 flex items-center justify-start pointer-events-auto">
          <SpecularButton
            size="sm"
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
            className="group !px-3.5 !py-0 !h-[38px]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-white/20 bg-white/5 font-mono text-[10px] text-white transition-all group-hover:border-white/50 group-hover:bg-white/10 shadow-sm mr-1">
              SQ
            </div>
            <span className="font-mono tracking-tight text-[13px] text-neutral-100 uppercase">
              SATQUERY<span className="text-neutral-500 ml-1">AI</span>
            </span>
          </SpecularButton>
        </div>

        {/* Center: Dedicated floating box for Product, Features, Models, About only */}
        <div className="hidden md:flex items-center justify-center pointer-events-auto">
          <PillNav
            items={[
              { label: "Product", href: "/#product" },
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
            size="sm"
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
          >
            Contact
          </SpecularButton>
          <LiquidMetalButton
            label="Try SatQuery AI"
            href="/app"
            height={38}
            width={156}
            textColor="#ffffff"
            icon={<ArrowUpRight className="h-3.5 w-3.5 text-neutral-300" />}
          />
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center pointer-events-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-[#0e0e0e]/90 text-neutral-300 hover:text-white shadow-md transition-colors"
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
              href="/#product"
              onClick={(e) => handleMobileClick(e, "/#product")}
              className="text-sm font-medium text-neutral-300 py-1.5 hover:text-white transition-colors"
            >
              Product
            </Link>
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
