"use client";

import Image from "next/image";

export function EmptyState({ onSelectPrompt }: { onSelectPrompt?: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in select-none">
      <Image
        src="/logo/satquertlogo.png"
        alt="SatQuery AI"
        width={56}
        height={56}
        className="h-14 w-14 rounded-2xl object-contain mb-6 shadow-[0_0_24px_rgba(255,255,255,0.1)] shrink-0"
        priority
      />

      <h1 className="text-2xl sm:text-3xl font-bold tracking-widest text-white uppercase mb-3 font-sans">
        SATQUERY AI
      </h1>

      <p className="text-xs sm:text-sm text-neutral-400 max-w-lg leading-relaxed text-center font-normal">
        Ask your Earth observation imagery anything. Upload scenes to quantify changes, fuse radar and
        optical bands, and generate evidence-grounded reports.
      </p>
    </div>
  );
}

