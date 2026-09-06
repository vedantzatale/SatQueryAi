import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#070707] py-16 px-6 sm:px-8">
      <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row justify-between gap-10">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-white/20 bg-white/5 font-mono text-[10px] text-white">
              SQ
            </div>
            <span className="font-mono text-sm font-semibold tracking-wider text-white">
              SATQUERY<span className="text-neutral-500 ml-1">AI</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-400">
            Agentic vision-language system and conversational intelligence for Earth observation,
            remote sensing, and geospatial evidence.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-mono">
          <div className="space-y-2.5">
            <div className="uppercase tracking-wider text-neutral-400 font-semibold">Product</div>
            <div>
              <Link href="/#features" className="text-neutral-400 hover:text-white transition-colors">
                Overview
              </Link>
            </div>
            <div>
              <Link href="/features" className="text-neutral-400 hover:text-white transition-colors">
                Features
              </Link>
            </div>
            <div>
              <Link href="/models" className="text-neutral-400 hover:text-white transition-colors">
                Model Registry
              </Link>
            </div>
            <div>
              <Link href="/app" className="text-neutral-400 hover:text-white transition-colors">
                Live Workspace
              </Link>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="uppercase tracking-wider text-neutral-400 font-semibold">System</div>
            <div>
              <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                Architecture
              </Link>
            </div>
            <div>
              <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                Transparency & Provenance
              </Link>
            </div>
            <div>
              <Link href="/models" className="text-neutral-400 hover:text-white transition-colors">
                Specialist Encoders
              </Link>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="uppercase tracking-wider text-neutral-400 font-semibold">Connect</div>
            <div>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors">
                Contact Team
              </Link>
            </div>
            <div>
              <a
                href="https://github.com/vedantzatale/SatQueryAi"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1140px] mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-neutral-400">
        <div>© 2026 SatQuery AI. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>COPERNICUS · SENTINEL-1/2 · LANDSAT</span>
          <span>•</span>
          <span>EPSG:4326</span>
        </div>
      </div>
    </footer>
  );
}
