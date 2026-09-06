"use client";

export function EmptyState({ onSelectPrompt }: { onSelectPrompt?: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto my-auto animate-fade-in select-none">
      {/* Target/Radar glowing dot icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 mb-6 shadow-[0_0_20px_rgba(255,255,255,0.03)]">
        <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
      </div>

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

